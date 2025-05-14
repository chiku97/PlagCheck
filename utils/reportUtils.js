import fs from 'fs';
import path from 'path';

export async function generateReport(results) {
  const reportPath = path.resolve('reports', 'report.html');
  const reportDir = path.dirname(reportPath);

  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir);

  console.log(results)
  let rows = await results.map(r => `
    <tr class="${r.similarity > 80 ? 'high' : ''}">
      <td>${r.fileA}</td>
      <td>${r.fileB}</td>
      <td>${r.similarity}</td>
      <td><pre>${r.snippetA}</pre></td>
      <td><pre>${r.snippetB}</pre></td>
    </tr>
  `).join('\n');

  const html = `
    <html>
      <head>
        <title>Plagiarism Report</title>
        <style>
          body { font-family: sans-serif; margin: 2rem; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
          .high { background-color: #ffcccc; }
          pre { white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <h1>Code Plagiarism Report</h1>
        <table>
          <thead>
            <tr>
              <th>Repo A File</th>
              <th>Repo B File</th>
              <th>Similarity (%)</th>
              <th>Snippet A</th>
              <th>Snippet B</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `;

  fs.writeFileSync(reportPath, html);
  console.log(`✅ Report generated at: ${reportPath}`);
}

export function checkSimilarity(fileA, fileB, codeA, codeB, matches) {
  if (/\.(html|css)$/.test(fileA)) {
    const similarity = getSimilarity(codeA, codeB);
    if (similarity > 0) {
      matches.push({
        fileA,
        fileB,
        similarity: similarity.toFixed(2),
        snippetA: codeA.slice(0, 200),
        snippetB: codeB.slice(0, 200),
      });
    }
  }
}
