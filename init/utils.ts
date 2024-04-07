import dayjs from "dayjs";
import { readdir, stat } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { sum, formatBytes } from "@pureadmin/utils";
import {
  name,
  version,
  engines,
  dependencies,
  devDependencies
} from "../package.json";

/** The absolute path to the working directory where the 'node' process was started */
const root: string = process.cwd();

/**
 * @description Generates a new absolute path based on the optional path fragment
 * @param dir path fragment, default 'build'
 * @param metaUrl 'url' of the metaUrl module, if called outside the 'build' directory, 'import.meta.url' must be passed
 */
const pathResolve = (dir = ".", metaUrl = import.meta.url) => {
  // The absolute path to the current file directory
  const currentFileDir = dirname(fileURLToPath(metaUrl));
  // build The absolute path to the directory
  const buildDir = resolve(currentFileDir, "build");
  // The absolute path of resolution
  const resolvedPath = resolve(currentFileDir, dir);
  // Check that the absolute path of the resolution is in the build directory
  if (resolvedPath.startsWith(buildDir)) {
    // In the build directory, return the current file path
    return fileURLToPath(metaUrl);
  }
  // It is not in the build directory, and returns the absolute path after resolution
  return resolvedPath;
};

/** Set an alias */
const alias: Record<string, string> = {
  "@": pathResolve("../src"),
  "@build": pathResolve()
};

/** The name of the platform, the version, the version of 'node' and 'pnpm' required to run, dependencies, and the type hint of the last build time */
const __APP_INFO__ = {
  pkg: { name, version, engines, dependencies, devDependencies },
  lastBuildTime: dayjs(new Date()).format("YYYY-MM-DD HH:mm:ss")
};

/** Handle environment variables */
const warpperEnv = (envConf: Recordable): ViteEnv => {
  // 默认值
  const ret: ViteEnv = {
    VITE_PORT: 8848,
    VITE_PUBLIC_PATH: "",
    VITE_ROUTER_HISTORY: "",
    VITE_CDN: false,
    VITE_HIDE_HOME: "false",
    VITE_COMPRESSION: "none"
  };

  for (const envName of Object.keys(envConf)) {
    let realName = envConf[envName].replace(/\\n/g, "\n");
    realName =
      realName === "true" ? true : realName === "false" ? false : realName;

    if (envName === "VITE_PORT") {
      realName = Number(realName);
    }
    ret[envName] = realName;
    if (typeof realName === "string") {
      process.env[envName] = realName;
    } else if (typeof realName === "object") {
      process.env[envName] = JSON.stringify(realName);
    }
  }
  return ret;
};

const fileListTotal: number[] = [];

/** Get the total size of all files in the specified folder */
const getPackageSize = options => {
  const { folder = "dist", callback, format = true } = options;
  readdir(folder, (err, files: string[]) => {
    if (err) throw err;
    let count = 0;
    const checkEnd = () => {
      ++count == files.length &&
        callback(format ? formatBytes(sum(fileListTotal)) : sum(fileListTotal));
    };
    files.forEach((item: string) => {
      stat(`${folder}/${item}`, async (err, stats) => {
        if (err) throw err;
        if (stats.isFile()) {
          fileListTotal.push(stats.size);
          checkEnd();
        } else if (stats.isDirectory()) {
          getPackageSize({
            folder: `${folder}/${item}/`,
            callback: checkEnd
          });
        }
      });
    });
    files.length === 0 && callback(0);
  });
};

export { root, pathResolve, alias, __APP_INFO__, warpperEnv, getPackageSize };
