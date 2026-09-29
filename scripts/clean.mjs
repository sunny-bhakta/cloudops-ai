import { rm } from 'node:fs/promises';

await rm('apps/api/dist', { recursive: true, force: true });
await rm('packages/ai-contracts/dist', { recursive: true, force: true });
await rm('apps/api/tsconfig.build.tsbuildinfo', { force: true });
await rm('packages/ai-contracts/tsconfig.tsbuildinfo', { force: true });
