import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { FlatCompat } from '@eslint/eslintrc';
import { defineConfig, globalIgnores } from 'eslint/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const modulesDir = path.resolve(__dirname, 'src', 'modules');

function moduleAliasNames() {
  if (!fs.existsSync(modulesDir)) {
    return [];
  }

  return fs.readdirSync(modulesDir)
    .map((name) => [`~${name}`, `${__dirname}/src/modules/${name}`]);
}

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default defineConfig([
  globalIgnores(['dist', 'coverage', 'node_modules']),
  ...compat.extends('airbnb', 'airbnb/hooks'),
  {
    files: ['**/*.{js,jsx,mjs}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        SCALER_VARS: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: [
            '.js',
            '.jsx',
          ],
        },
        alias: {
          map: [
            ['@common', `${__dirname}/src/common/`],
            ['jest-config', '../jest/'],
            ...moduleAliasNames(),
          ],
          extensions: ['.js', '.jsx'],
        },
      },
      jest: {
        version: 'latest',
      },
    },
    rules: {
      'array-bracket-spacing': ['error', 'never'],
      'comma-spacing': 'error',
      'default-case': 'error',
      'eol-last': 'error',
      eqeqeq: 'error',
      'func-call-spacing': 'error',
      indent: ['error', 2, { SwitchCase: 1 }],
      'jsx-quotes': 'error',
      'key-spacing': 'error',
      'keyword-spacing': 1,
      'max-len': ['error', { code: 120 }],
      'no-console': 1,
      'no-multi-spaces': 'error',
      'no-sequences': 'error',
      'no-use-before-define': 'error',
      quotes: ['error', 'single', {
        avoidEscape: true,
        allowTemplateLiterals: true,
      }],
      radix: 'error',
      semi: 'error',
      'function-paren-newline': 0,
      'function-call-argument-newline': 0,
      'default-param-last': 0,
      'class-methods-use-this': 0,
      'no-shadow': 0,
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrors: 'none',
      }],
      'import/no-extraneous-dependencies': 0,
      'import/no-unresolved': 0,
      'react/jsx-filename-extension': 0,
      'react/react-in-jsx-scope': 0,
      'react/function-component-definition': 0,
      'react/jsx-no-bind': 0,
      'react/jsx-no-constructed-context-values': 0,
      'react/jsx-no-useless-fragment': 0,
      'react/no-unstable-nested-components': 0,
      'react/no-invalid-html-attribute': 0,
      'no-else-return': 0,
      'react/no-array-index-key': 0,
      'arrow-parens': 0,
      'jsx-a11y/click-events-have-key-events': 0,
      'react/prop-types': 0,
      'react/jsx-props-no-spreading': 0,
      'react/forbid-prop-types': 0,
      'react/require-default-props': 0,
      'react/default-props-match-prop-types': 0,
      'no-underscore-dangle': 0,
      'import/order': 0,
      'no-continue': 0,
      'func-names': 0,
      'no-new': 0,
      'jsx-a11y/label-has-associated-control': 0,
      'react/no-unescaped-entities': 0,
      'react/sort-comp': 0,
      'jsx-a11y/no-autofocus': 0,
      'jsx-a11y/media-has-caption': 0,
      'import/prefer-default-export': 0,
      'import/no-cycle': [
        'error',
        {
          ignoreExternal: true,
        },
      ],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 0,
      'react-hooks/refs': 0,
      'react-hooks/immutability': 0,
      'react-hooks/purity': 0,
      'react-hooks/static-components': 0,
      'react-hooks/preserve-manual-memoization': 0,
      'react-hooks/use-memo': 0,
      'react-hooks/globals': 0,
      'react-hooks/incompatible-library': 0,
    },
  },
  ...compat.extends('plugin:jest/recommended', 'plugin:jest/style').map(
    (config) => ({
      ...config,
      files: ['**/*.test.js'],
    }),
  ),
  {
    files: ['**/*.test.js'],
    rules: {
      'jest/consistent-test-it': [
        'error',
        { fn: 'test', withinDescribe: 'test' },
      ],
      'jest/lowercase-name': 'error',
      'jest/prefer-strict-equal': 'error',
      'jest/prefer-todo': 'error',
      'jest/valid-title': 'error',
    },
  },
]);
