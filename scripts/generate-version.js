import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function getGitInfo() {
  try {
    const raw = execSync('git log -1 --format="%h|%s|%ci"', {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();

    if (raw) {
      const [commit, message, releaseDate] = raw.split('|');
      return {
        commit: commit?.trim() || 'unknown',
        message: message?.trim() || 'New release update',
        releaseDate: releaseDate?.trim() || new Date().toISOString(),
      };
    }
  } catch {
    // Git might not be accessible or inside container
  }

  // Fallback to Vercel or environment variables
  const commit = (
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GIT_COMMIT_SHA ||
    process.env.COMMIT_REF ||
    'live'
  ).substring(0, 7);

  const message =
    process.env.VERCEL_GIT_COMMIT_MESSAGE ||
    process.env.GIT_COMMIT_MESSAGE ||
    'Performance & UI updates';

  return {
    commit,
    message,
    releaseDate: new Date().toISOString(),
  };
}

function generateVersionFile() {
  const pkgPath = path.join(rootDir, 'package.json');
  let pkgVersion = '1.1.0';
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    pkgVersion = pkg.version || '1.1.0';
  } catch (e) {
    console.warn('Could not read package.json version:', e.message);
  }

  const gitInfo = getGitInfo();
  const buildTime = Date.now();

  const versionPayload = {
    version: `v${pkgVersion}`,
    commit: gitInfo.commit,
    message: gitInfo.message,
    buildTime,
    releaseDate: gitInfo.releaseDate,
    timestamp: new Date(buildTime).toISOString(),
  };

  const publicDir = path.join(rootDir, 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const versionFilePath = path.join(publicDir, 'version.json');
  fs.writeFileSync(versionFilePath, JSON.stringify(versionPayload, null, 2), 'utf8');

  console.log('✅ Generated public/version.json:');
  console.log(`   Version: ${versionPayload.version} (${versionPayload.commit})`);
  console.log(`   Message: "${versionPayload.message}"`);
  console.log(`   BuildTime: ${versionPayload.buildTime}`);

  return versionPayload;
}

generateVersionFile();
