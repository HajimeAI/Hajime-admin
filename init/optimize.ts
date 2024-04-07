/**
 * This file works on the 'optimizeDeps.include' dependency of 'vite.config.ts' on pre-built config items
 * Relying on pre-build, when 'vite' starts, the following modules in include will be compiled into esm format and cached to the node_modules/.vite folder, when the page is loaded into the corresponding module, if the browser has a cache, it will read the browser cache, if not, it will read the local cache and load it on demand
 * Especially if you disable browser caching (which should only happen during the debugging phase) you must add the corresponding module to the include, otherwise you will run into the problem of stuttering when switching pages in the development environment (vite will think it is a new dependency package and will reload and force refresh the page), because it cannot use the browser cache and is not cached locally in node_modules/.vite
 * Note: If you are using a third-party library that is imported globally, i.e. into a src/main.ts file, you don't need to add them to include, because vite will automatically cache them to node_modules/.vite
 */
const include = [
  "qs",
  "mitt",
  "dayjs",
  "axios",
  "pinia",
  "vue-i18n",
  "vue-types",
  "js-cookie",
  "vue-tippy",
  "pinyin-pro",
  "sortablejs",
  "@vueuse/core",
  "@pureadmin/utils",
  "responsive-storage"
];

/**
 * Dependencies that are forcibly excluded in prebuilds
 * Tips: All local icon modules introduced with '@iconify-icons/' should be added to the following 'exclude', because the platform's recommended way of use is where it needs to be introduced and it is all a single introduction, no need to prebuild, just let the browser load
 */
const exclude = [
  "@iconify-icons/ep",
  "@iconify-icons/ri",
  "@pureadmin/theme/dist/browser-utils"
];

export { include, exclude };
