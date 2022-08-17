// import { ICitrineConfiguration } from "../config/config";
// import fs from "fs";
// import path from "path";
//
// export function loadApis(config: ICitrineConfiguration) {
//   // Load api files from node_modules
//   const nodeApis = fs
//     .readdirSync(path.join(config.server.root, "node_modules"))
//     .filter((f) => f.startsWith("citrine-"))
//     .map((f) =>
//       listApiFiles(
//         path.join(config.server.root, "node_modules", f, "dist"),
//         false
//       )
//     )
//     .flat();
//
//   const rootApis = listApiFiles(path.join(config.server.root, "dist"), false);
//
//
// }
//
// function listApiFiles(dir: string, allowTs: boolean) {
//   const apiPath = path.join(dir, "api");
//
//   if (!fs.existsSync(apiPath)) return [];
//
//   return fs
//     .readdirSync(apiPath)
//     .filter((f) => f.endsWith(".js"))
//     .map((f) => path.join(apiPath, f));
// }
