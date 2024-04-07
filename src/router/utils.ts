import {
  type RouterHistory,
  type RouteRecordRaw,
  type RouteComponent,
  createWebHistory,
  createWebHashHistory
} from "vue-router";
import { router } from "./index";
import { isProxy, toRaw } from "vue";
import { useTimeoutFn } from "@vueuse/core";
import {
  isString,
  cloneDeep,
  isAllEmpty,
  intersection,
  storageLocal,
  isIncludeAllChildren
} from "@pureadmin/utils";
import { getConfig } from "@/config";
import type { menuType } from "@/layout/types";
import { buildHierarchyTree } from "@/utils/tree";
import { userKey, type DataInfo } from "@/utils/auth";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { usePermissionStoreHook } from "@/store/modules/permission";
const IFrame = () => import("@/layout/frameView.vue");
// https://cn.vitejs.dev/guide/features.html#glob-import
const modulesRoutes = import.meta.glob("/src/views/**/*.{vue,tsx}");

// Dynamic routing
import { getAsyncRoutes } from "@/api/routes";

function handRank(routeInfo: any) {
  const { name, path, parentId, meta } = routeInfo;
  return isAllEmpty(parentId)
    ? isAllEmpty(meta?.rank) ||
      (meta?.rank === 0 && name !== "Home" && path !== "/")
      ? true
      : false
    : false;
}

/** Routes are sorted in ascending order of rank under meta in the route */
function ascending(arr: any[]) {
  arr.forEach((v, index) => {
    // When rank does not exist, it is automatically created according to the order, and the homepage route always comes first
    if (handRank(v)) v.meta.rank = index + 2;
  });
  return arr.sort(
    (a: { meta: { rank: number } }, b: { meta: { rank: number } }) => {
      return a?.meta.rank - b?.meta.rank;
    }
  );
}

/** Filter menus where showLink is false in meta */
function filterTree(data: RouteComponent[]) {
  const newTree = cloneDeep(data).filter(
    (v: { meta: { showLink: boolean } }) => v.meta?.showLink !== false
  );
  newTree.forEach(
    (v: { children }) => v.children && (v.children = filterTree(v.children))
  );
  return newTree;
}

/** Filter the directory with children length 0, when there is no menu in the directory,
 * This directory will be filtered, and the directory does not have the roles permission granted,
 * When there is only one menu in the directory that has the permission to display, then the directory will be displayed
 * */
function filterChildrenTree(data: RouteComponent[]) {
  const newTree = cloneDeep(data).filter((v: any) => v?.children?.length !== 0);
  newTree.forEach(
    (v: { children }) => v.children && (v.children = filterTree(v.children))
  );
  return newTree;
}

/** Determine whether two arrays have the same value as each other */
function isOneOfArray(a: Array<string>, b: Array<string>) {
  return Array.isArray(a) && Array.isArray(b)
    ? intersection(a, b).length > 0
      ? true
      : false
    : true;
}

/** Retrieve the role roles of the currently logged-in user from localStorage, and filter the menu without permissions */
function filterNoPermissionTree(data: RouteComponent[]) {
  const currentRoles =
    storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [];
  const newTree = cloneDeep(data).filter((v: any) =>
    isOneOfArray(v.meta?.roles, currentRoles)
  );
  newTree.forEach(
    (v: any) => v.children && (v.children = filterNoPermissionTree(v.children))
  );
  return filterChildrenTree(newTree);
}

/** Get the parent path collection by specifying 'key', default 'key' is 'path' */
function getParentPaths(value: string, routes: RouteRecordRaw[], key = "path") {
  // Deep traversal lookup
  function dfs(routes: RouteRecordRaw[], value: string, parents: string[]) {
    for (let i = 0; i < routes.length; i++) {
      const item = routes[i];
      // Returns the parent path
      if (item[key] === value) return parents;
      // children do not recursively if they do not exist or are empty
      if (!item.children || !item.children.length) continue;
      // When you look down, put the current path into the stack
      parents.push(item.path);

      if (dfs(item.children, value, parents).length) return parents;
      // Deep traversal looks for the current path out of the stack when it is not found
      parents.pop();
    }
    // Returns an empty array if not found
    return [];
  }

  return dfs(routes, value, []);
}

/** Find the route information corresponding to 'path' */
function findRouteByPath(path: string, routes: RouteRecordRaw[]) {
  let res = routes.find((item: { path: string }) => item.path == path);
  if (res) {
    return isProxy(res) ? toRaw(res) : res;
  } else {
    for (let i = 0; i < routes.length; i++) {
      if (
        routes[i].children instanceof Array &&
        routes[i].children.length > 0
      ) {
        res = findRouteByPath(path, routes[i].children);
        if (res) {
          return isProxy(res) ? toRaw(res) : res;
        }
      }
    }
    return null;
  }
}

function addPathMatch() {
  if (!router.hasRoute("pathMatch")) {
    router.addRoute({
      path: "/:pathMatch(.*)",
      name: "pathMatch",
      redirect: "/error/404"
    });
  }
}

/** Handling dynamic routes (routes returned by the backend) */
function handleAsyncRoutes(routeList) {
  if (routeList.length === 0) {
    usePermissionStoreHook().handleWholeMenus(routeList);
  } else {
    formatFlatteningRoutes(addAsyncRoutes(routeList)).map(
      (v: RouteRecordRaw) => {
        // Prevent duplicate routes from being added
        if (
          router.options.routes[0].children.findIndex(
            value => value.path === v.path
          ) !== -1
        ) {
          return;
        } else {
          // Remember that after pushing a route to routes, you also need to use addRoute so that the route can jump normally
          router.options.routes[0].children.push(v);
          // The final route is in ascending order
          ascending(router.options.routes[0].children);
          if (!router.hasRoute(v?.name)) router.addRoute(v);
          const flattenRouters: any = router
            .getRoutes()
            .find(n => n.path === "/");
          router.addRoute(flattenRouters);
        }
      }
    );
    usePermissionStoreHook().handleWholeMenus(routeList);
  }
  addPathMatch();
}

/** Initialize the route ('new Promise' is written to prevent an infinite loop in asynchronous requests)*/
function initRouter() {
  if (getConfig()?.CachingAsyncRoutes) {
    // Enable dynamic route caching local localStorage
    const key = "async-routes";
    const asyncRouteList = storageLocal().getItem(key) as any;
    if (asyncRouteList && asyncRouteList?.length > 0) {
      return new Promise(resolve => {
        handleAsyncRoutes(asyncRouteList);
        resolve(router);
      });
    } else {
      return new Promise(resolve => {
        getAsyncRoutes().then(({ data }) => {
          handleAsyncRoutes(cloneDeep(data));
          storageLocal().setItem(key, data);
          resolve(router);
        });
      });
    }
  } else {
    return new Promise(resolve => {
      getAsyncRoutes().then(({ data }) => {
        handleAsyncRoutes(cloneDeep(data));
        resolve(router);
      });
    });
  }
}

/**
 * Process multi-level nested routes into one-dimensional arrays
 * @param routesList incoming routes
 * @returns Returns the processed one-dimensional route
 */
function formatFlatteningRoutes(routesList: RouteRecordRaw[]) {
  if (routesList.length === 0) return routesList;
  let hierarchyList = buildHierarchyTree(routesList);
  for (let i = 0; i < hierarchyList.length; i++) {
    if (hierarchyList[i].children) {
      hierarchyList = hierarchyList
        .slice(0, i + 1)
        .concat(hierarchyList[i].children, hierarchyList.slice(i + 1));
    }
  }
  return hierarchyList;
}

/**
 * One-dimensional arrays are processed into multi-level nested arrays (routes of level 3 and above are all shot into level 2, and keep-alive only supports cache level 2)
 * https://github.com/pure-admin/vue-pure-admin/issues/67
 * @param routesList processed 1D routing menu array
 * @returns Returns the format in which the one-dimensional array is reprocessed into a prescribed route
 */
function formatTwoStageRoutes(routesList: RouteRecordRaw[]) {
  if (routesList.length === 0) return routesList;
  const newRoutesList: RouteRecordRaw[] = [];
  routesList.forEach((v: RouteRecordRaw) => {
    if (v.path === "/") {
      newRoutesList.push({
        component: v.component,
        name: v.name,
        path: v.path,
        redirect: v.redirect,
        meta: v.meta,
        children: []
      });
    } else {
      newRoutesList[0]?.children.push({ ...v });
    }
  });
  return newRoutesList;
}

/** Handling cache routes (adding, deleting, refreshing) */
function handleAliveRoute({ name }: ToRouteType, mode?: string) {
  switch (mode) {
    case "add":
      usePermissionStoreHook().cacheOperate({
        mode: "add",
        name
      });
      break;
    case "delete":
      usePermissionStoreHook().cacheOperate({
        mode: "delete",
        name
      });
      break;
    case "refresh":
      usePermissionStoreHook().cacheOperate({
        mode: "refresh",
        name
      });
      break;
    default:
      usePermissionStoreHook().cacheOperate({
        mode: "delete",
        name
      });
      useTimeoutFn(() => {
        usePermissionStoreHook().cacheOperate({
          mode: "add",
          name
        });
      }, 100);
  }
}

/** Filter dynamic routes from the backend Regenerate canonical routes */
function addAsyncRoutes(arrRoutes: Array<RouteRecordRaw>) {
  if (!arrRoutes || !arrRoutes.length) return;
  const modulesRoutesKeys = Object.keys(modulesRoutes);
  arrRoutes.forEach((v: RouteRecordRaw) => {
    v.meta.backstage = true;
    if (v?.children && v.children.length && !v.redirect)
      v.redirect = v.children[0].path;
    if (v?.children && v.children.length && !v.name)
      v.name = (v.children[0].name as string) + "Parent";
    if (v.meta?.frameSrc) {
      v.component = IFrame;
    } else {
      const index = v?.component
        ? modulesRoutesKeys.findIndex(ev => ev.includes(v.component as any))
        : modulesRoutesKeys.findIndex(ev => ev.includes(v.path));
      v.component = modulesRoutes[modulesRoutesKeys[index]];
    }
    if (v?.children && v.children.length) {
      addAsyncRoutes(v.children);
    }
  });
  return arrRoutes;
}

/** Get route history pattern https://next.router.vuejs.org/zh/guide/essentials/history-mode.html */
function getHistoryMode(routerHistory): RouterHistory {
  const historyMode = routerHistory.split(",");
  const leftMode = historyMode[0];
  const rightMode = historyMode[1];
  // no param
  if (historyMode.length === 1) {
    if (leftMode === "hash") {
      return createWebHashHistory("");
    } else if (leftMode === "h5") {
      return createWebHistory("");
    }
  } //has param
  else if (historyMode.length === 2) {
    if (leftMode === "hash") {
      return createWebHashHistory(rightMode);
    } else if (leftMode === "h5") {
      return createWebHistory(rightMode);
    }
  }
}

/** Get permissions at the button level on the current page */
function getAuths(): Array<string> {
  return router.currentRoute.value.meta.auths as Array<string>;
}

/** Is there button-level permission */
function hasAuth(value: string | Array<string>): boolean {
  if (!value) return false;
  /** Get all custom 'code' values at the button level from the 'meta' field of the current route */
  const metaAuths = getAuths();
  if (!metaAuths) return false;
  const isAuths = isString(value)
    ? metaAuths.includes(value)
    : isIncludeAllChildren(value, metaAuths);
  return isAuths ? true : false;
}

/** Get the first menu in all menus (top-level menu)*/
function getTopMenu(tag = false): menuType {
  const topMenu = usePermissionStoreHook().wholeMenus[0]?.children[0];
  tag && useMultiTagsStoreHook().handleTags("push", topMenu);
  return topMenu;
}

export {
  hasAuth,
  getAuths,
  ascending,
  filterTree,
  initRouter,
  getTopMenu,
  addPathMatch,
  isOneOfArray,
  getHistoryMode,
  addAsyncRoutes,
  getParentPaths,
  findRouteByPath,
  handleAliveRoute,
  formatTwoStageRoutes,
  formatFlatteningRoutes,
  filterNoPermissionTree
};
