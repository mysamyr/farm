import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
// import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      'assets/**',
      'packages/db-prisma/src/generated/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: ['tsconfig.json', 'packages/*/tsconfig.json'],
          noWarnOnMultipleProjects: true,
        },
        node: {
          extensions: ['.ts', '.tsx'],
        },
      },
      'import/extensions': ['.ts', '.tsx'],
      'import/ignore': ['node_modules'],
    },
    extends: tseslint.configs.recommendedTypeChecked,
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-namespace': 'warn',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'react-dom',
              group: 'external',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['react', 'react-dom'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'always-and-inside-groups',
        },
      ],
      'import/no-unresolved': 'off',
      'import/no-cycle': 'warn',
      'import/no-self-import': 'error',
    },
  },
  // {
  //   files: ['apps/client/**/*.{ts,tsx}'],
  //   plugins: {
  //     'react-hooks': {
  //       rules: reactHooks.rules,
  //     },
  //   },
  //   rules: {
  //     ...reactHooks.configs.flat.recommended.rules,
  //   },
  // },
  eslintConfigPrettier
);
