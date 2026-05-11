import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintReact from "@eslint-react/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import importX from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    ignores: [
      "src/types/generated/**",
      ".next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "public/**",
      "next-env.d.ts",
    ],
  },

  js.configs.recommended,

  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  ...tseslint.configs.recommended,

  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ...eslintReact.configs.recommended,
  },
  {
    rules: {
      "@eslint-react/exhaustive-deps": "off",
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-hooks/set-state-in-effect": "warn",
    },
  },

  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },

  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: { "import-x": importX },
    rules: {
      "import-x/no-anonymous-default-export": "warn",
    },
  },

  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: { "jsx-a11y": jsxA11y },
    rules: {
      "jsx-a11y/alt-text": ["warn", { elements: ["img"], img: ["Image"] }],
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",
    },
  },

  {
    plugins: { prettier: prettierPlugin },
    rules: {
      ...prettierConfig.rules,
      "prettier/prettier": "error",
    },
  },

  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },

  {
    files: ["index.js", "*.cjs", ".prettierrc.js"],
    languageOptions: {
      sourceType: "commonjs",
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];
