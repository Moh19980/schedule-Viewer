import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react: pluginReact,
    },
    extends: [
      "plugin:react/recommended",
      "plugin:react/jsx-runtime",
      "plugin:@eslint/js/recommended",
    ],
    settings: {
      react: {
        version: "detect",
      },
    },
  },
]);