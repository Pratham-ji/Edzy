#!/usr/bin/env node

/**
 * Run Expo with a strict execution time limit
 * Automatically shuts down Metro & dev servers after the specified time
 * to prevent unnecessary background CPU, memory, and time consumption.
 */

const { spawn } = require('child_process');
const path = require('path');

// Duration in minutes (default 5 mins, or pass via command line: node run-with-timeout.js 3)
const durationMinutes = parseFloat(process.argv[2] || process.env.TIME_LIMIT_MINUTES || '5');
const durationSeconds = Math.round(durationMinutes * 60);

console.log('=====================================================');
console.log(`⏱️  EDZY EXPO RUNNER - STRICT TIME LIMIT: ${durationMinutes} MINUTE(S)`);
console.log('    Dev server will automatically terminate when limit expires');
console.log('    to ensure zero background resource consumption.');
console.log('=====================================================\n');

const expoProcess = spawn('npx', ['expo', 'start', '--port', '8081'], {
  cwd: path.resolve(__dirname, '..'),
  stdio: 'inherit',
});

let remaining = durationSeconds;

const interval = setInterval(() => {
  remaining -= 10;
  if (remaining > 0 && remaining % 60 === 0) {
    console.log(`\n⏳ [Time Limit Watchdog] ${remaining / 60} minute(s) remaining...`);
  }
}, 10000);

const timeoutHandle = setTimeout(() => {
  console.log('\n=====================================================');
  console.log(`🛑 TIME LIMIT REACHED (${durationMinutes}m). Gracefully stopping Expo server...`);
  console.log('=====================================================');
  clearInterval(interval);
  expoProcess.kill('SIGTERM');
  setTimeout(() => {
    process.exit(0);
  }, 1000);
}, durationSeconds * 1000);

process.on('SIGINT', () => {
  clearTimeout(timeoutHandle);
  clearInterval(interval);
  expoProcess.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  clearTimeout(timeoutHandle);
  clearInterval(interval);
  expoProcess.kill('SIGTERM');
  process.exit(0);
});
