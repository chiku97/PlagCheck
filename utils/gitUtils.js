import simpleGit from 'simple-git';
import fs from 'fs-extra';
import path from 'path';

export async function cloneRepos(repoAUrl, repoBUrl) {
  const baseDir = path.join('repos', '..', 'repos');

  // Ensure the URLs have the `.git` suffix
  if (!repoAUrl.endsWith('.git')) {
    repoAUrl += '.git';
  }
  if (!repoBUrl.endsWith('.git')) {
    repoBUrl += '.git';
  }

  // Extract repository names from URLs
  const repoAName = path.basename(repoAUrl, '.git');
  const repoBName = path.basename(repoBUrl, '.git');

  // Create paths for the repositories
  const repoAPath = path.join(baseDir, repoAName);
  const repoBPath = path.join(baseDir, repoBName);

  const git = simpleGit();

  // Ensure the base directory exists
  await fs.ensureDir(baseDir);

  // Clone the first repository only if it doesn't already exist
  if (!fs.existsSync(repoAPath)) {
    try {
      console.log(`Cloning ${repoAUrl} into ${repoAPath} (excluding node_modules)`);
      await git.clone(repoAUrl, repoAPath, ['--filter=blob:none', '--sparse']);

      // Ensure the .git directory exists before proceeding
      const repoAGitDir = path.join(repoAPath, '.git');
      if (!fs.existsSync(repoAGitDir)) {
        throw new Error(`Failed to initialize .git directory for ${repoAUrl}`);
      }

      // Configure sparse checkout for the first repository
      const sparseCheckoutPathA = path.join(repoAGitDir, 'info', 'sparse-checkout');
      fs.writeFileSync(sparseCheckoutPathA, '/*\n!node_modules/');
      await git.cwd(repoAPath).raw(['sparse-checkout', 'reapply']);
    } catch (error) {
      console.error(`Error cloning repository ${repoAUrl}:`, error.message);
      throw error;
    }
  } else {
    console.log(`Repository ${repoAUrl} already cloned at ${repoAPath}. Skipping clone.`);
  }

  // Clone the second repository
  try {
    console.log(`Cloning ${repoBUrl} into ${repoBPath} (excluding node_modules)`);
    await git.clone(repoBUrl, repoBPath, ['--filter=blob:none', '--sparse']);

    // Ensure the .git directory exists before proceeding
    const repoBGitDir = path.join(repoBPath, '.git');
    if (!fs.existsSync(repoBGitDir)) {
      throw new Error(`Failed to initialize .git directory for ${repoBUrl}`);
    }

    // Configure sparse checkout for the second repository
    const sparseCheckoutPathB = path.join(repoBGitDir, 'info', 'sparse-checkout');
    fs.writeFileSync(sparseCheckoutPathB, '/*\n!node_modules/');
    await git.cwd(repoBPath).raw(['sparse-checkout', 'reapply']);
  } catch (error) {
    console.error(`Error cloning repository ${repoBUrl}:`, error.message);
    throw error;
  }

  return { repoAPath, repoBPath, repoAName, repoBName, repoAUrl, repoBUrl };
}


