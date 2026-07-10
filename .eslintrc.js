module.exports = {
  root: true,
  extends: [
    '@react-native',
    'plugin:import/recommended',
    'plugin:react-native-a11y/basic',
    'plugin:tailwindcss/recommended',
  ],
  plugins: ['unicorn', 'i18next'],
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  rules: {
    // Import hygiene
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-default-export': 'error',
    'import/no-duplicates': 'error',

    // React
    'react/function-component-definition': [
      'error',
      { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
    ],
    'react/jsx-pascal-case': 'error',

    // React Native
    'react-native/split-platform-components': 'error',

    // Tailwind / NativeWind
    'tailwindcss/no-contradicting-classname': 'error',

    // i18n — off for now (react-i18next not wired up until a later step), turned on once it is
    'i18next/no-literal-string': 'off',

    // File & function size limits
    'max-lines': ['warn', { max: 500, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': ['warn', { max: 160, skipBlankLines: true, skipComments: true }],
    complexity: ['warn', { max: 20 }],

    // Naming / filenames
    'unicorn/filename-case': [
      'error',
      { cases: { camelCase: true, pascalCase: true }, ignore: [/^nativewind-env\.d\.ts$/] },
    ],

    // Code quality
    'prefer-const': 'error',
    'no-var': 'error',
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-nested-ternary': 'error',
    'no-restricted-syntax': [
      'error',
      {
        selector: 'JSXElement > JSXExpressionContainer > ConditionalExpression',
        message:
          'Avoid ternary operators inside JSX expressions. Extract to a variable before the return, or use {bool && <A/>} for simple cases.',
      },
    ],
    'no-unneeded-ternary': 'error',
    'one-var': ['error', 'never'],
    'no-multi-assign': 'error',
    'func-style': ['warn', 'expression', { allowArrowFunctions: true }],
  },
  overrides: [
    {
      // TypeScript-aware rules only run where the TS parser is active (set by
      // @react-native/eslint-config's own override for *.ts/*.tsx below).
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/no-use-before-define': ['error', { functions: false }],
        'no-magic-numbers': 'off',
        '@typescript-eslint/no-magic-numbers': [
          'warn',
          {
            ignore: [-1, 0, 1, 2, 3, 4, 5, 10, 16, 24, 60, 100, 1000, 1024],
            ignoreArrayIndexes: true,
            ignoreDefaultValues: true,
            ignoreEnums: true,
            ignoreReadonlyClassProperties: true,
            ignoreTypeIndexes: true,
            enforceConst: true,
          },
        ],
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'variable',
            format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
            leadingUnderscore: 'allow',
          },
          { selector: 'function', format: ['camelCase', 'PascalCase'] },
          { selector: 'typeLike', format: ['PascalCase'] },
          { selector: 'enumMember', format: ['PascalCase'] },
          { selector: 'objectLiteralProperty', format: null },
          { selector: 'typeProperty', format: null },
          { selector: 'import', format: null },
        ],
      },
    },
    {
      files: ['ui/**/*.tsx'],
      rules: {
        'max-lines-per-function': ['warn', { max: 80, skipBlankLines: true, skipComments: true }],
        'max-lines': ['warn', { max: 150, skipBlankLines: true, skipComments: true }],
        'react/jsx-max-depth': ['warn', { max: 4 }],
        'no-restricted-syntax': [
          'error',
          {
            selector: 'JSXElement > JSXExpressionContainer > ConditionalExpression',
            message:
              'Avoid ternary operators inside JSX expressions. Extract to a variable before the return, or use {bool && <A/>} for simple cases.',
          },
          {
            selector: 'JSXExpressionContainer > JSXEmptyExpression',
            message:
              'No uses comentarios como separadores de secciones en JSX — extraé la sección a un componente con nombre.',
          },
        ],
      },
    },
    {
      files: [
        '*.config.js',
        '.eslintrc.js',
        'metro.config.js',
        'babel.config.js',
        'jest.config.js',
        'tailwind.config.js',
      ],
      rules: {
        'import/no-default-export': 'off',
        'unicorn/filename-case': 'off',
      },
    },
    {
      files: ['__tests__/**', '**/*.test.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-magic-numbers': 'off',
        'import/no-default-export': 'off',
      },
    },
  ],
};
