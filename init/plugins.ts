import { cdn } from "./cdn";
import vue from "@vitejs/plugin-vue";
import { pathResolve } from "./utils";
import { viteBuildInfo } from "./info";
import svgLoader from "vite-svg-loader";
import type { PluginOption } from "vite";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { configCompressPlugin } from "./compress";
import removeNoMatch from "vite-plugin-router-warn";
import { visualizer } from "rollup-plugin-visualizer";
import removeConsole from "vite-plugin-remove-console";
import { themePreprocessorPlugin } from "@pureadmin/theme";
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";
import { genScssMultipleScopeVars } from "../src/layout/theme";
import { vitePluginFakeServer } from "vite-plugin-fake-server";

export function getPluginsList(
  VITE_CDN: boolean,
  VITE_COMPRESSION: ViteCompression
): PluginOption[] {
  const lifecycle = process.env.npm_lifecycle_event;
  return [
    vue(),
    vueJsx(),
    VueI18nPlugin({
      runtimeOnly: true,
      compositionOnly: true,
      include: [pathResolve("../locales/**")]
    }),
    viteBuildInfo(),
    /**
     * Removed unnecessary vue-router dynamic routing warnings in the development environmentNo match found for location with path
     * Non-necessarily, see https://github.com/vuejs/router/issues/521 and https://github.com/vuejs/router/issues/359
     * vite-plugin-router-warn is only enabled in the development environment, only processes vue-router files and runs only once when the service is started or restarted, and the performance cost is negligible
     */
    removeNoMatch(),
    // mock支持
    // vitePluginFakeServer({
    //   logger: false,
    //   include: "mock",
    //   infixName: false,
    //   enableProd: true
    // }),
    // Customize the theme
    themePreprocessorPlugin({
      scss: {
        multipleScopeVars: genScssMultipleScopeVars(),
        extract: true
      }
    }),
    // SVG componentization support
    svgLoader(),
    VITE_CDN ? cdn : null,
    configCompressPlugin(VITE_COMPRESSION),
    // Delete the console in the online environment
    removeConsole({ external: ["src/assets/iconfont/iconfont.js"] }),
    // Packaged analytics
    lifecycle === "report"
      ? visualizer({ open: true, brotliSize: true, filename: "report.html" })
      : (null as any)
  ];
}
