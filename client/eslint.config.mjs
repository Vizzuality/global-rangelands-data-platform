import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintReact from "@eslint-react/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import nextPlugin from "@next/eslint-plugin-next";
import importX from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettierRecommended from "eslint-plugin-prettier/recommended";

const nextCoreWebVitals = {
  plugins: { "@next/next": nextPlugin },
  rules: {
    ...nextPlugin.configs.recommended.rules,
    ...nextPlugin.configs["core-web-vitals"].rules,
  },
};

const reactHooksRecommended = {
  plugins: { "react-hooks": reactHooks },
  rules: {
    ...reactHooks.configs.recommended.rules,
    "react-hooks/set-state-in-effect": "warn",
  },
};

const jsxA11yRecommended = {
  plugins: { "jsx-a11y": jsxA11y },
  rules: {
    "jsx-a11y/alt-text": ["warn", { elements: ["img"], img: ["Image"] }],
    "jsx-a11y/aria-props": "warn",
    "jsx-a11y/aria-proptypes": "warn",
    "jsx-a11y/aria-unsupported-elements": "warn",
    "jsx-a11y/role-has-required-aria-props": "warn",
    "jsx-a11y/role-supports-aria-props": "warn",
  },
};

const importXRecommended = {
  plugins: { "import-x": importX },
  rules: { "import-x/no-anonymous-default-export": "warn" },
};

const projectRules = {
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "warn",
  },
};

const commonJsFiles = {
  files: ["index.js", "*.cjs", ".prettierrc.js"],
  languageOptions: { sourceType: "commonjs" },
  rules: { "@typescript-eslint/no-require-imports": "off" },
};

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
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  eslintReact.configs.recommended,
  { rules: { "@eslint-react/exhaustive-deps": "off" } },
  reactHooksRecommended,
  nextCoreWebVitals,
  importXRecommended,
  jsxA11yRecommended,
  prettierRecommended,
  projectRules,
  commonJsFiles,
];
