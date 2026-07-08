import { mergeConfig, type UserConfig } from "vite";

export default (config: UserConfig) => {
  return mergeConfig(config, {
    optimizeDeps: {
      include: ["url-parse", "tus-js-client"],
    },
  });
};
