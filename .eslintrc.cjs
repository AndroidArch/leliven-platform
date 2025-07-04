/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript/recommended',
    '@vue/eslint-config-prettier'
  ],
  env: {
    'vue/setup-compiler-macros': true
  },
  rules: {
    'comma-dangle': 'off',
    'vue/valid-v-slot': 'off',
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/comma-dangle': 'off',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
    '@typescript-eslint/no-explicit-any': [
      'warn', // 或 'error'
      {
        fixToUnknown: true // 建议将 any 自动改为 unknown
      }
    ]
  }
};
