const { NODE_ENV } = process.env
const isLocal = NODE_ENV === undefined || NODE_ENV === 'local'

module.exports = {
  /**
   * **基础规范使用Standard**
   * https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
   */
  extends: ['standard'],
  plugins: ['@typescript-eslint'],
  rules: {
    'import/first': 2,
    'import/newline-after-import': 2,
    'no-alert': isLocal ? 0 : 2,
    'no-console': isLocal ? 0 : 2,
    'no-debugger': isLocal ? 0 : 2,
    'no-empty-function': 2,
    'no-multi-spaces': 2,
    'no-new': 0,
    'no-var': 2,
    'object-shorthand': 2,
    'padded-blocks': [2, 'never'],
    'prefer-const': 2,
    'space-before-function-paren': [
      2,
      {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always'
      }
    ],
    '@typescript-eslint/no-unused-vars': 2
  },
  overrides: [
    {
      files: ['demo/**/*'],
      rules: {
        'no-console': 0
      }
    }
  ],
  parser: '@typescript-eslint/parser'
}
