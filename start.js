const { spawn } = require('child_process');
const { existsSync } = require('fs');

const isRailway =
  !!process.env.RAILWAY_SERVICE_NAME ||
  !!process.env.RAILWAY_ENVIRONMENT ||
  existsSync('/app/RAILWAY');

if (isRailway) {
  const child = spawn('node', ['server/src/index.js'], { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code));
} else {
  const child = spawn('npx', ['expo', 'start'], {
    stdio: 'inherit',
    env: { ...process.env, CI: undefined },
  });
  child.on('exit', (code) => process.exit(code));
}
