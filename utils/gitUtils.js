import simpleGit from 'simple-git';
import fs from 'fs-extra';
import path from 'path';


export async function cloneRepos(repoA, repoB) {
    const baseDir = path.join('/tmp', 'repos');
  const repoAPath = path.join(baseDir, 'repoA');
  const repoBPath = path.join(baseDir, 'repoB');

  const git = simpleGit();

  await fs.remove(baseDir);
  await fs.ensureDir(baseDir);
  await git.clone(repoA, repoAPath);
  await git.clone(repoB, repoBPath);

  return { repoAPath, repoBPath };
}


