import fs from 'fs';
import path from 'path';
import os from 'os'; // Import os module for temp directory

export async function generateReport(results, isFirstBatch = false) {
  const tempDir = os.tmpdir();
  const reportPath = path.join(tempDir, 'report.html');

  if (isFirstBatch) {
    const initialContent = `
      <html>
        <head>
          <title>Repository Comparison Report</title>
          <style>
            body { font-family: sans-serif; margin: 2rem; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
            .high { background-color: #ffcccc; }
            pre { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          <h1>Repository Comparison Report</h1>
          <table>
            <thead>
              <tr>
                <th>Repo A Name</th>
                <th>Repo A URL</th>
                <th>Repo B Name</th>
                <th>Repo B URL</th>
                <th>Repo A File</th>
                <th>Repo B File</th>
                <th>Similarity (%)</th>
                <th>Snippet A</th>
                <th>Snippet B</th>
              </tr>
            </thead>
            <tbody>
    `;
    fs.writeFileSync(reportPath, initialContent);
    console.log(`✅ Initialized report at: ${reportPath}`);
  }

  const rows = results.map((repoResult) =>
    repoResult.map((r) => `
      <tr class="${r.similarity > 80 ? 'high' : ''}">
        <td>${r.repoAName || 'N/A'}</td>
        <td><a href="${r.repoAUrl || '#'}">${r.repoAUrl || 'N/A'}</a></td>
        <td>${r.repoBName || 'N/A'}</td>
        <td><a href="${r.repoBUrl || '#'}">${r.repoBUrl || 'N/A'}</a></td>
        <td>${r.fileA || 'N/A'}</td>
        <td>${r.fileB || 'N/A'}</td>
        <td>${r.similarity !== undefined ? r.similarity : 'N/A'}</td>
        <td><pre>${r.snippetA || 'N/A'}</pre></td>
        <td><pre>${r.snippetB || 'N/A'}</pre></td>
      </tr>
    `).join('')
  ).join('');

  fs.appendFileSync(reportPath, rows);
  console.log(`✅ Appended rows to report at: ${reportPath}`);
}

// Finalize the report by closing the HTML structure
export async function finalizeReport() {
  const tempDir = os.tmpdir();
  const reportPath = path.join(tempDir, 'report.html');

  const closingContent = `
          </tbody>
        </table>
      </body>
    </html>
  `;
  fs.appendFileSync(reportPath, closingContent);
  console.log(`✅ Finalized report at: ${reportPath}`);
}
