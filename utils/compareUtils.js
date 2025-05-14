import esprima from 'esprima';
import { glob } from 'glob';
import fs from 'fs';
import path from 'path';

function extractFunctions(code) {
  const functions = [];
  try {
    const tree = esprima.parseScript(code, { range: true });

    tree.body.forEach((node) => {
      if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression') {
        const codeSegment = code.slice(...node.range);
        functions.push(codeSegment);
      } else if (node.type === 'VariableDeclaration') {
        // Handle arrow functions assigned to variables
        node.declarations.forEach((declaration) => {
          if (declaration.init && (declaration.init.type === 'ArrowFunctionExpression' || declaration.init.type === 'FunctionExpression')) {
            const codeSegment = code.slice(...declaration.init.range);
            functions.push(codeSegment);
          }
        });
      } else if (node.type === 'ClassDeclaration') {
        // Handle class methods
        node.body.body.forEach((method) => {
          if (method.type === 'MethodDefinition') {
            const codeSegment = code.slice(...method.range);
            functions.push(codeSegment);
          }
        });
      }
    });

    // If no functions are found, include the entire code
    if (functions.length === 0) {
      functions.push(code);
    }

    console.log("Extracted Functions:", functions); // Debugging
  } catch (error) {
    console.error("Error parsing code:", error.message);
  }

  return functions;
}

function normalize(code) {
  const normalized = code
    .replace(/\/\/.*$/gm, '') // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim();

  console.log("Normalized Code:", normalized); // Debugging
  return normalized;
}

function getLevenshteinDistance(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // Deletion
        matrix[i][j - 1] + 1, // Insertion
        matrix[i - 1][j - 1] + cost // Substitution
      );
    }
  }

  return matrix[a.length][b.length];
}

function getSimilarity(codeA, codeB) {
  const a = normalize(codeA);
  const b = normalize(codeB);

  const distance = getLevenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);

  const similarity = ((maxLength - distance) / maxLength) * 100; // Similarity as a percentage
  console.log(`Similarity between:\nA: ${a}\nB: ${b}\nScore: ${similarity}`);
  return similarity;
}

export async function compareRepos(repoAPath, repoBPath) {
  const filesA = glob.sync('**/*.{js,html,css,png,jpg,jpeg,gif,svg}', { cwd: repoAPath });
  const filesB = glob.sync('**/*.{js,html,css,png,jpg,jpeg,gif,svg}', { cwd: repoBPath });

  console.log("Files in Repo A:", filesA);
  console.log("Files in Repo B:", filesB);

  const matches = [];

  for (const fileA of filesA) {
    const fileAPath = path.join(repoAPath, fileA);
    const codeA = fs.readFileSync(fileAPath, 'utf-8');

    for (const fileB of filesB) {
      const fileBPath = path.join(repoBPath, fileB);

      const extA = path.extname(fileA).toLowerCase();
      const extB = path.extname(fileB).toLowerCase();
      if (extA !== extB) continue;

      if (/\.(png|jpg|jpeg|gif|svg)$/.test(fileA)) {
        const bufferA = fs.readFileSync(fileAPath);
        const bufferB = fs.readFileSync(fileBPath);

        if (Buffer.compare(bufferA, bufferB) === 0) {
          matches.push({
            fileA,
            fileB,
            similarity: 100,
            snippetA: 'Binary file (e.g., image)',
            snippetB: 'Binary file (e.g., image)',
          });
        }
        continue;
      }

      const codeB = fs.readFileSync(fileBPath, 'utf-8');

      if (/\.(js)$/.test(fileA)) {
        const functionsA = extractFunctions(codeA);
        const functionsB = extractFunctions(codeB);

        for (const fA of functionsA) {
          for (const fB of functionsB) {
            const similarity = getSimilarity(fA, fB);
            if (similarity > 10) {
              matches.push({
                fileA,
                fileB,
                similarity: similarity.toFixed(2),
                snippetA: fA.slice(0, 200),
                snippetB: fB.slice(0, 200),
              });
            }
          }
        }
      } else if (/\.(html|css)$/.test(fileA)) {
        const similarity = getSimilarity(codeA, codeB);
        if (similarity > 10) {
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
  }

  console.log("Matches Found:", matches);
  return matches;
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