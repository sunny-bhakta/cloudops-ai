import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'apps/**/*.test.ts',
      'apps/**/*.spec.ts',
      'packages/**/*.test.ts',
      'packages/**/*.spec.ts',
    ],
  },
});



// import { defineConfig } from 'vitest/config';

// export default defineConfig({
//   test: {
//     globals: true,
//     environment: 'node',
//   },
// });
