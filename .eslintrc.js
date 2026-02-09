module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "node": true,
  },
  "extends": ["eslint:recommended", "plugin:react/recommended", "plugin:@typescript-eslint/recommended"],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaFeatures": {
      "jsx": true
    },
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": ["react", "@typescript-eslint", "prettier"],
  ignorePatterns: [".husky/**", "out/**", "build/**"],
  "rules": {
    "react/jsx-filename-extension": [1, {
      extensions: [".ts", ".tsx", ".jsx"]
    }],
    "import/extensions": "on",
    "react/prop-types": "on",
    "jsx-a11y/anchor-is-valid": "on",
    "react/jsx-props-no-spreading": ["error", {
      custom: "ignore"
    }],
    "prettier/prettier": ["error", {
      endOfLine: "auto"
    }],
    "react/no-unescaped-entities": "on",
    "import/no-cycle": [0, {
      ignoreExternal: true
    }],
    "prefer-const": "on",
    "no-use-before-define": "on",
    "@typescript-eslint/explicit-module-boundary-types": "on",
    "no-useless-escape": "on",
    "no-underscore-dangle": "on",
    "react/require-default-props": "on",
    "react-hooks/exhaustive-deps": "on",
    "class-methods-use-this": "on",
    "no-shadow": "on",
    'import/prefer-default-export': "on",
    "camelcase": "on",
    "@typescript-eslint/no-var-requires": "on",
    "global-require": "on",
    "radix": "on",
    "arrow-body-style": "on",
    "jsx-a11y/no-static-element-interactions": "on",
    "jsx-a11y/click-events-have-key-events": "on",
    "react/jsx-uses-react": "on",
    "react/react-in-jsx-scope": "on",
    "@typescript-eslint/no-explicit-any": "on",
    "@typescript-eslint/no-unused-vars": "on",
    "no-unused-vars": "warn",
  },
  settings: {
    "import/resolver": {
      "babel-module": {
        extensions: [".js", ".jsx", ".ts", ".tsx"]
      },
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
        paths: ["src"]
      }
    } 
  }
};