import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

const background = "#F7F4FF";

export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    ...minimal2023Preset,
    transparent: { ...minimal2023Preset.transparent, favicons: [] },
    maskable: { ...minimal2023Preset.maskable, padding: 0.35, resizeOptions: { background } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background } },
  },
  images: ["public/icon.svg"],
});
