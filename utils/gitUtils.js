import simpleGit from 'simple-git';
import fs from 'fs-extra';
import path from 'path';

export async function cloneRepos(repoAUrl, repoBUrl) {
  const baseDir = path.join('repos', '..', 'repos');

  // Extract repository names from URLs
  const repoAName = path.basename(repoAUrl, '.git');
  const repoBName = path.basename(repoBUrl, '.git');

  // Create paths for the repositories
  const repoAPath = path.join(baseDir, repoAName);
  const repoBPath = path.join(baseDir, repoBName);

  const git = simpleGit();

  // Ensure the base directory exists and clean it up
  await fs.remove(baseDir);
  await fs.ensureDir(baseDir);

  // Clone the repositories
  console.log(`Cloning ${repoAUrl} into ${repoAPath}`);
  await git.clone(repoAUrl, repoAPath);

  console.log(`Cloning ${repoBUrl} into ${repoBPath}`);
  await git.clone(repoBUrl, repoBPath);

  return { repoAPath, repoBPath, repoAName, repoBName, repoAUrl, repoBUrl };
}


