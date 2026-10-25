export default {
  testRunner: "vitest",
  plugins: ["@stryker-mutator/vitest-runner"],
  mutate: ["src/lib/**/*.ts", "!src/lib/**/*.test.ts"],
  reporters: ["clear-text", "progress"],
  // Skips Stryker's tsconfig rewrite: it needs the TypeScript JS API, which TS 7 doesn't ship.
  tsconfigFile: "",
};
