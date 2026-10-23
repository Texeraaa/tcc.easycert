/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/../tsconfig.json",
        // Processa ESM de dependências NestJS dentro do transform do ts-jest
        diagnostics: false,
      },
    ],
  },
  // Permite que o Jest transforme módulos ESM dentro do node_modules/.pnpm
  // que são usados nas dependências NestJS/AWS SDK
  transformIgnorePatterns: [],
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@easycert/types$": "<rootDir>/../../packages/types/src/index.ts",
  },
};
