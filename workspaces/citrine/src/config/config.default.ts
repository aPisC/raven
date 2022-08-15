import { ICitrineConfiguration } from "./config";

export const defaultConfig: ICitrineConfiguration = {
  server: {
    port: 3000,
    root: process.cwd(),
  },
};
