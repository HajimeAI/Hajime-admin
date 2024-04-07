// The internationalization of the multi-component library is compatible with the internationalization of local projects
import { type I18n, createI18n } from "vue-i18n";
import type { App, WritableComputedRef } from "vue";
import { responsiveStorageNameSpace } from "@/config";
import { storageLocal, isObject } from "@pureadmin/utils";

// Element-Plus is internationalized
import enLocale from "element-plus/dist/locale/en.mjs";
import zhLocale from "element-plus/dist/locale/zh-cn.mjs";

const siphonI18n = (function () {
  // The internationalization configuration is initialized only once
  let cache = Object.fromEntries(
    Object.entries(
      import.meta.glob("../../locales/*.y(a)?ml", { eager: true })
    ).map(([key, value]: any) => {
      const matched = key.match(/([A-Za-z0-9-_]+)\./i)[1];
      return [matched, value.default];
    })
  );
  return (prefix = "zh-CN") => {
    return cache[prefix];
  };
})();

export const localesConfigs = {
  zh: {
    ...siphonI18n("zh-CN"),
    ...zhLocale
  },
  en: {
    ...siphonI18n("en"),
    ...enLocale
  }
};

/** Gets the key keys of all nested objects in the object and splits them into strings with dots */
function getObjectKeys(obj) {
  const stack = [];
  const keys: Set<string> = new Set();

  stack.push({ obj, key: "" });

  while (stack.length > 0) {
    const { obj, key } = stack.pop();

    for (const k in obj) {
      const newKey = key ? `${key}.${k}` : k;

      if (obj[k] && isObject(obj[k])) {
        stack.push({ obj: obj[k], key: newKey });
      } else {
        keys.add(newKey);
      }
    }
  }

  return keys;
}

/** The key cache will be expanded */
const keysCache: Map<string, Set<string>> = new Map();
const flatI18n = (prefix = "zh-CN") => {
  let cache = keysCache.get(prefix);
  if (!cache) {
    cache = getObjectKeys(siphonI18n(prefix));
    keysCache.set(prefix, cache);
  }
  return cache;
};

/**
 * Internationalization Conversion Tool Function (Automatically reads files in the locales folder of the root directory for internationalization matching)
 * @param message message
 * @returns Converted message
 */
export function transformI18n(message: any = "") {
  if (!message) {
    return "";
  }

  // Handle the storage of dynamic routes in the title, format {en:"",en:""}
  if (typeof message === "object") {
    const locale: string | WritableComputedRef<string> | any =
      i18n.global.locale;
    return message[locale?.value];
  }

  const key = message.match(/(\S*)\./)?.input;

  if (key && flatI18n("zh-CN").has(key)) {
    return i18n.global.t.call(i18n.global.locale, message);
  } else if (!key && Object.hasOwn(siphonI18n("zh-CN"), message)) {
    // Compatible with non-nested forms of internationalization
    return i18n.global.t.call(i18n.global.locale, message);
  } else {
    return message;
  }
}

/** This function only works with the i18n Ally plug-in to internationalize the smart prompt, which has no practical meaning (only works for the prompt), and can be deleted if you don't need internationalization */
export const $t = (key: string) => key;

export const i18n: I18n = createI18n({
  legacy: false,
  // locale:
  //   storageLocal().getItem<StorageConfigs>(
  //     `${responsiveStorageNameSpace()}locale`
  //   )?.locale ?? "zh",
  locale: "en",
  fallbackLocale: "en",
  messages: localesConfigs
});

export function useI18n(app: App) {
  app.use(i18n);
}
