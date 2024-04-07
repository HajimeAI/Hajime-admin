// import "@/utils/sso";
import Cookies from "js-cookie";
import { getConfig } from "@/config";
import NProgress from "@/utils/progress";
import { transformI18n } from "@/plugins/i18n";
import { buildHierarchyTree } from "@/utils/tree";
import remainingRouter from "./modules/remaining";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { isUrl, openLink, storageLocal, isAllEmpty } from "@pureadmin/utils";
import {
  ascending,
  getTopMenu,
  initRouter,
  addPathMatch,
  isOneOfArray,
  getHistoryMode,
  findRouteByPath,
  handleAliveRoute,
  formatTwoStageRoutes,
  formatFlatteningRoutes
} from "./utils";
import {
  type Router,
  createRouter,
  type RouteRecordRaw,
  type RouteComponent
} from "vue-router";
import {
  type DataInfo,
  userKey,
  removeToken,
  multipleTabsKey
} from "@/utils/auth";

/** Automatically import all static routes, no more manual ingestion!Match all files with the .ts extension in the src/router/modules directory (any nesting level), except for remaining.ts files
 * How to match all files please see: https://github.com/mrmlnc/fast-glob#basic-syntax
 * How to exclude files please see: https://cn.vitejs.dev/guide/features.html#negative-patterns
 */
const modules: Record<string, any> = import.meta.glob(
  ["./modules/**/*.ts", "!./modules/**/remaining.ts"],
  {
    eager: true
  }
);

/** Original static route (no processing done) */
const routes = [];

Object.keys(modules).forEach(key => {
  routes.push(modules[key].default);
});

/** Export the processed static routes (all routes of level 3 and above are photographed as level 2) */
export const constantRoutes: Array<RouteRecordRaw> = formatTwoStageRoutes(
  formatFlatteningRoutes(buildHierarchyTree(ascending(routes.flat(Infinity))))
);

/** Used to render menus, keeping the original hierarchy */
export const constantMenus: Array<RouteComponent> = ascending(
  routes.flat(Infinity)
).concat(...remainingRouter);

/** Do not participate in the routing of the menu */
export const remainingPaths = Object.keys(remainingRouter).map(v => {
  return remainingRouter[v].path;
});

/** Create a route instance */
export const router: Router = createRouter({
  history: getHistoryMode(import.meta.env.VITE_ROUTER_HISTORY),
  routes: constantRoutes.concat(...(remainingRouter as any)),
  strict: true,
  scrollBehavior(to, from, savedPosition) {
    return new Promise(resolve => {
      if (savedPosition) {
        return savedPosition;
      } else {
        if (from.meta.saveSrollTop) {
          const top: number =
            document.documentElement.scrollTop || document.body.scrollTop;
          resolve({ left: 0, top });
        }
      }
    });
  }
});

/** Reset Route */
export function resetRouter() {
  router.getRoutes().forEach(route => {
    const { name, meta } = route;
    if (name && router.hasRoute(name) && meta?.backstage) {
      router.removeRoute(name);
      router.options.routes = formatTwoStageRoutes(
        formatFlatteningRoutes(
          buildHierarchyTree(ascending(routes.flat(Infinity)))
        )
      );
    }
  });
  usePermissionStoreHook().clearAllCachePage();
}

/** Route Whitelist */
const whiteList = ["/login"];

const { VITE_HIDE_HOME } = import.meta.env;

router.beforeEach((to: ToRouteType, _from, next) => {
  if (to.meta?.keepAlive) {
    handleAliveRoute(to, "add");
    //  Page refresh as a whole and click tab refresh
    if (_from.name === undefined || _from.name === "Redirect") {
      handleAliveRoute(to);
    }
  }
  const userInfo = storageLocal().getItem<DataInfo<number>>(userKey);
  NProgress.start();
  const externalLink = isUrl(to?.name as string);
  if (!externalLink) {
    to.matched.some(item => {
      if (!item.meta.title) return "";
      const Title = getConfig().Title;
      if (Title)
        document.title = `${transformI18n(item.meta.title)} | ${Title}`;
      else document.title = transformI18n(item.meta.title);
    });
  }
  /** If you have already logged in and have login information, you cannot jump to the route whitelist, but continue to stay on the current page */
  function toCorrectRoute() {
    whiteList.includes(to.fullPath) ? next(_from.fullPath) : next();
  }
  if (Cookies.get(multipleTabsKey) && userInfo) {
    // You don't have permission to jump to page 403
    if (to.meta?.roles && !isOneOfArray(to.meta?.roles, userInfo?.roles)) {
      next({ path: "/error/403" });
    }
    // After Hide Homepage is enabled, manually enter the Welcome route on the homepage in the address bar of the browser to redirect to the 404 page
    if (VITE_HIDE_HOME === "true" && to.fullPath === "/welcome") {
      console.log("After enabling Hide Homepage, manually enter the homepage welcome route in the browser address bar, you will be redirected to the 404 page", to)
      next({ path: "/error/404" });
    }
    if (_from?.name) {
      // name is a hyperlink
      if (externalLink) {
        openLink(to?.name as string);
        NProgress.done();
      } else {
        toCorrectRoute();
      }
    } else {
      // flushed
      if (
        usePermissionStoreHook().wholeMenus.length === 0 &&
        to.path !== "/login"
      ) {
        // Use the following method to replace the initRouter:
        usePermissionStoreHook().handleWholeMenus([]);
        addPathMatch();
        if (!useMultiTagsStoreHook().getMultiTagsCache) {
          const { path } = to;
          const route = findRouteByPath(path, router.options.routes[0].children);
          // The tabs for query and params mode routing parameters are not handled here
          if (route && route.meta?.title) {
            useMultiTagsStoreHook().handleTags("push", {
              path: route.path,
              name: route.name,
              meta: route.meta,
            });
          }
        }

      }
      toCorrectRoute();
    }
  } else {
    if (to.path !== "/login") {
      if (whiteList.indexOf(to.path) !== -1) {
        next();
      } else {
        removeToken();
        next({ path: "/login" });
      }
    } else {
      next();
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
