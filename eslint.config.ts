import { defineConfig, globalIgnores } from 'eslint/config';
import configPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import pluginN from 'eslint-plugin-n';
import globals from 'globals';
import tsEslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['node_modules/**', 'dist/**', 'assets/**', 'public/**']),
  tsEslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  pluginN.configs['flat/recommended-module'],
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsEslint.parser,
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: 'module',
      },
    },
    rules: {
      'no-console': 'error',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-require-imports': 'error',

      // Prefer import-plugin resolution for TS files; disable plugin-n missing import
      'n/no-missing-import': 'off',
      'n/no-deprecated-api': 'warn',

      // Import hygiene
      'import/named': 'error',
      'import/default': 'error',
      'import/no-unresolved': [
        'error',
        { commonjs: true, caseSensitive: true },
      ],
      'import/no-duplicates': 'error',
      'import/no-self-import': 'error',
      'import/no-cycle': ['warn', { maxDepth: 3 }],
      'import/no-deprecated': 'warn',
      'import/no-useless-path-segments': ['warn', { noUselessIndex: true }],
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: [
            '**/*.test.ts',
            '**/*.config.ts',
            'eslint.config.ts',
          ],
        },
      ],
      'import/newline-after-import': 'warn',
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
    },
  },
  {
    files: ['server/**/*.ts'],
    languageOptions: {
      parser: tsEslint.parser,
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: 'module',
      },
      globals: globals.node,
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.ts'],
        },
        typescript: {
          alwaysTryTypes: true,
          project: ['./server/tsconfig.json'],
        },
      },
    },
  },
  {
    files: ['client/**/*.ts'],
    languageOptions: {
      parser: tsEslint.parser,
      parserOptions: { ecmaVersion: 2023, sourceType: 'module' },
      globals: globals.browser,
    },
    settings: {
      'import/resolver': {
        node: { extensions: ['.ts'] },
        typescript: {
          alwaysTryTypes: true,
          project: ['./client/tsconfig.json'],
        },
      },
    },
    rules: {
      'no-console': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
    },
  },
  {
    files: ['eslint.config.ts'],
    rules: {
      'import/no-unresolved': 'off',
    },
  },
  configPrettier,
]);
