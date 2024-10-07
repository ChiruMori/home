import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


export default [
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  // 忽略 config 目录下全部 webpack 配置文件
  // {files: ["config/**/*.{js,mjs,cjs}"], rules: {"import/no-commonjs": "off"}},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  // 自动指定 React 版本
  {settings: {react: {version: "detect"}}},
  // 自定义规则
  // 允许使用 any
  {rules: {"@typescript-eslint/no-explicit-any": "off"}},
];