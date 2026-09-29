import { rm } from 'node:fs/promises';

await rm('apps/api/dist', { recursive: true, force: true });
await rm('apps/api/tsconfig.build.tsbuildinfo', { force: true });

await rm('packages/ai-audit/dist', { recursive: true, force: true });
await rm('packages/ai-audit/tsconfig.build.tsbuildinfo', { force: true });

await rm('packages/ai-contracts/dist', { recursive: true, force: true });
await rm('packages/ai-contracts/tsconfig.build.tsbuildinfo', { force: true });

await rm('packages/ai-guardrails/dist', { recursive: true, force: true });
await rm('packages/ai-guardrails/tsconfig.build.tsbuildinfo', { force: true });

await rm('packages/ai-policy/dist', { recursive: true, force: true });
await rm('packages/ai-policy/tsconfig.build.tsbuildinfo', { force: true });

await rm('packages/ai-providers/dist', { recursive: true, force: true });
await rm('packages/ai-providers/tsconfig.build.tsbuildinfo', { force: true });

await rm('packages/ai-testkit/dist', { recursive: true, force: true });
await rm('packages/ai-testkit/tsconfig.build.tsbuildinfo', { force: true });

await rm('packages/ai-toools-sdk/dist', { recursive: true, force: true });
await rm('packages/ai-tools-sdk/tsconfig.build.tsbuildinfo', { force: true });
