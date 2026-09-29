import { execFileSync } from 'node:child_process';

const workspaces = [
  '@cloudops/ai-contracts',
  '@cloudops/ai-providers',
  '@cloudops/ai-tools-sdk',
  'api',
];

for (const workspace of workspaces) {
  console.log(`\n▶ Building ${workspace}`);

  execFileSync(
    'npm',
    ['run', '-w', workspace, 'build'],
    {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    },
  );
}


// import { execFileSync } from 'node:child_process';

// const packages = [
//   '@cloudops/ai-contracts',
//   '@cloudops/ai-providers',
// //   '@cloudops/ai-tools-sdk',
// //   '@cloudops/ai-guardrails',
// //   '@cloudops/ai-policy',
// //   '@cloudops/ai-audit',
// ];

// function build(workspace) {
//   console.log(`\nBuilding ${workspace}...`);

//   execFileSync(
//     'npm',
//     ['run', '-w', workspace, 'build'],
//     {
//       stdio: 'inherit',
//       shell: process.platform === 'win32',
//     },
//   );
// }

// for (const workspace of packages) {
//   build(workspace);
// }

// build('api');

// console.log('\nBuild completed successfully.');
