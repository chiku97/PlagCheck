import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { cloneRepos } from './utils/gitUtils.js';
import { compareRepos } from './utils/compareUtils.js';
import { generateReport } from './utils/reportUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware to parse form data
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// Serve the form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'form.html'));
});

// Handle form submission
app.post('/compare', async (req, res) => {
  const { repoA, repoB } = req.body;

  try {
    const { repoAPath, repoBPath } = await cloneRepos(repoA, repoB);
    const matches = await compareRepos(repoAPath, repoBPath);

    console.log(matches)
    // Generate the report
    await generateReport(matches);

    // Redirect to the report page
    res.redirect('/report');
  } catch (error) {
    res.status(500).send(`<h1>Error</h1><p>${error.message}</p>`);
  }
});

// Serve the report
app.get('/report', (req, res) => {
  const reportPath = path.resolve('reports', 'report.html');
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
