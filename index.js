import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { cloneRepos } from './utils/gitUtils.js';
import { compareRepos } from './utils/compareUtils.js';
import { generateReport, finalizeReport } from './utils/reportUtils.js'; // Added finalizeReport import
import os from 'os'; // Import os module for temp directory

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse form data
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// Serve the form
app.get('/', (req, res) => {
  fs.writeFileSync(path.join(__dirname, 'reports', 'report.html'), ""); 
  res.sendFile(path.join(__dirname, 'public', 'form.html'));
});

// Handle form submission
app.post('/compare', async (req, res) => {
  const { repos } = req.body;

  try {
    const repoUrls = repos.split(',').map((url) => url.trim());

    if (repoUrls.length < 2) {
      return res.status(400).send('Please provide at least two repository URLs.');
    }

    let isFirstBatch = true;

    for (let i = 0; i < repoUrls.length; i++) {
      for (let j = i + 1; j < repoUrls.length; j++) {
        try {
          const { repoAPath, repoBPath, repoAName, repoBName, repoAUrl, repoBUrl } = await cloneRepos(repoUrls[i], repoUrls[j]);

          const matches = await compareRepos(repoAPath, repoBPath, repoAName, repoAUrl, repoBName, repoBUrl);

          await generateReport([matches], isFirstBatch);
          isFirstBatch = false;
        } catch (error) {
          console.error(`Error processing repositories: ${repoUrls[i]} and ${repoUrls[j]}`, error);
        }
      }
    }

    await finalizeReport();
    res.redirect('/report');
  } catch (error) {
    console.error('Error in /compare route:', error);
    res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
  }
});

// Serve the report
app.get('/report', (req, res) => {
  const reportPath = path.resolve('./reports', 'report.html'); // Use os.tmpdir() for the temp directory
  if (fs.existsSync(reportPath)) {
    res.sendFile(reportPath);
  } else {
    res.status(404).send('<h1>Report not found</h1>');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
