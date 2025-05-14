import fs from 'fs';
import path from 'path';
import os from 'os'; // Import os module for temp directory

export let reportContent = ''; // Store the report content in memory

export async function generateReport(results, isFirstBatch = false) {
  if (isFirstBatch) {
    reportContent = `
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
    console.log(`✅ Initialized report content.`);
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

  reportContent += rows;
  console.log(`✅ Appended rows to report content.`);
}

export async function finalizeReport() {
  const closingContent = `
          </tbody>
        </table>
      </body>
    </html>
  `;
  reportContent += closingContent;
  console.log(`✅ Finalized report content.`);
}
