import { spawn } from 'child_process';
import path from 'path';

// CI等で渡されるJest用の --runInBand などの引数をフィルタリング
const args = process.argv.slice(2).filter((arg) => arg !== '--runInBand');

const vitestBin = path.resolve('node_modules', '.bin', 'vitest');

const vitestProcess = spawn(vitestBin, ['run', ...args], {
  stdio: 'inherit',
});

vitestProcess.on('exit', (code) => {
  process.exit(code ?? 0);
});
