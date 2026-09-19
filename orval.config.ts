import { defineConfig } from "orval";

const SPEC_URL = "https://raw.githubusercontent.com/masiama/libri-api/main/openapi/openapi.json";

export default defineConfig({
  libriApi: {
    input: { target: SPEC_URL },
    output: {
      mode: "tags-split",
      target: "src/generated/api/endpoints",
      schemas: "src/generated/api/models",
      client: "react-query",
      clean: true,
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: "./src/api/mutator.ts",
          name: "customFetch",
        },
      },
    },
    hooks: {
      afterAllFilesWrite: "pnpm fmt",
    },
  },
});
