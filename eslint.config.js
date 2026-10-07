import github from 'eslint-plugin-github'
import globals from 'globals'
import parser from '@typescript-eslint/parser'
import typescript from '@typescript-eslint/eslint-plugin'

export default [
  {ignores: ['dist/**', 'lib/**', 'node_modules/**', '**/*.js']},
  github.getFlatConfigs().recommended,
  {
    files: ['src/**/*.ts'],
    plugins: {'@typescript-eslint': typescript},
    languageOptions: {
      parser,
      parserOptions: {project: './tsconfig.json'},
      globals: {...globals.node, CanvasRenderingContext2D: 'readonly'}
    },
    rules: {
      'i18n-text/no-en': 'off',
      'eslint-comments/no-use': 'off',
      'import/no-namespace': 'off',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/array-type': 'error',
      '@typescript-eslint/ban-ts-comment': 'off',
      camelcase: 'off',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'warn',
      'github/no-then': 'off'
    }
  }
]
