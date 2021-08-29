module.exports = {
  extends: [
    'taro/react',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
    'react/sort-comp': 'off',
    'react/no-unused-state': ['warn'],
    'react/jsx-filename-extension': [
      1,
      { extensions: ['.js', '.jsx', '.tsx'] },
    ],
    '@typescript-eslint/member-delimiter-style': 'off',
    '@typescript-eslint/explicit-function-return-type': 0,
    '@typescript-eslint/no-empty-function': ['warn'],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-empty-interface': ['warn'],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/camelcase': 'off',
    '@typescript-eslint/ban-ts-ignore': ['warn'],
    'import/first': 'off',
    '@typescript-eslint/no-shadow': 'off',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    useJSXTextNode: true,
    project: './tsconfig.json',
  },
};
