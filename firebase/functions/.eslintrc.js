module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    // "google" - firebase init put this here by default but caused many errors
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: [
      "firebase/functions/tsconfig.json",
      "firebase/functions/tsconfig.dev.json",
    ],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
  ],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    // quotes: ["error", "double"],
  },
};
