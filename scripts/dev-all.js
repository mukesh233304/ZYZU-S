const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');

console.log('\x1b[36m%s\x1b[0m', '=======================================================');
console.log('\x1b[36m%s\x1b[0m', " 🚀 Starting ZYZU'S Platform (Backend & Frontend)");
console.log('\x1b[36m%s\x1b[0m', ' 📡 Frontend: http://localhost:5173/');
console.log('\x1b[36m%s\x1b[0m', ' 📡 Backend:  http://localhost:3000/');
console.log('\x1b[36m%s\x1b[0m', '=======================================================');

// Start Backend API
const backend = spawn('node', ['src/server.js'], {
  cwd: rootDir,
  stdio: 'inherit',
  env: { ...process.env, PORT: '3000' }
});

// Start Frontend Dev Server
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: frontendDir,
  stdio: 'inherit',
  env: process.env
});

// Auto-open browser after 2 seconds
setTimeout(() => {
  const openCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  spawn(openCmd, ['http://localhost:5173/'], { shell: true, stdio: 'ignore' });
}, 2000);

function cleanup() {
  console.log('\n\x1b[33m%s\x1b[0m', 'Shutting down ZYZU\'S servers cleanly...');
  try { backend.kill(); } catch (e) {}
  try { frontend.kill(); } catch (e) {}
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
