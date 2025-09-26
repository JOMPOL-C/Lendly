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
        ...globals.node,
      },
    },
    ...js.configs.recommended,
  },
  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: "detect", // ให้ eslint-plugin-react ตรวจจาก package.json
      },
    },
  },
]);
