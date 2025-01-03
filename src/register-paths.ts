import path from 'path';
import { loadConfig, register } from 'tsconfig-paths';
import fs from 'fs';

const tsconfigPath = path.resolve(__dirname, '../tsconfig.json');
const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));

const outDir = tsconfig.compilerOptions.outDir || 'built';

const config = loadConfig();
if (config.resultType === 'success') {
    register({
        baseUrl: path.resolve(__dirname, `../${outDir}`),
        paths: config.paths
    });
}