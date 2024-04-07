
import type { RouteComponent, RouteLocationNormalized } from "vue-router";
import type { FunctionalComponent } from "vue";

declare global {
  interface ToRouteType extends RouteLocationNormalized {
    meta: CustomizeRouteMeta;
  }

  /**
   * @description The complete `meta` configuration table for child routes.
   */
  interface CustomizeRouteMeta {
    /** Menu name (compatible with internationalization and non-internationalization; if using internationalization, it must be added in the corresponding `locales` folder in the root directory) `Required`. */
    title: string;
    /** Menu icon `Optional`. */
    icon?: string | FunctionalComponent | IconifyIcon;
    /** Additional icons on the right side of the menu name. */
    extraIcon?: string | FunctionalComponent | IconifyIcon;
    showLink?: boolean;
    showParent?: boolean;
    roles?: Array<string>;
    auths?: Array<string>;
    keepAlive?: boolean;
    frameSrc?: string;
    frameLoading?: boolean;
    transition?: {
      /**
       * @see {@link https://next.router.vuejs.org/guide/advanced/transitions.html#transitions}
       * @see animate.css {@link https://animate.style}
       */
      name?: string;
      enterTransition?: string;
      leaveTransition?: string;
    };
    hiddenTag?: boolean;
    dynamicLevel?: number;

    activePath?: string;
  }

  /**
   * @description The complete configuration table for child routes.
   */
  interface RouteChildrenConfigsTable {
    path: string;
    name?: string;
    redirect?: string;
    component?: RouteComponent;
    meta?: CustomizeRouteMeta;
    children?: Array<RouteChildrenConfigsTable>;
  }

  /**
   */
  interface RouteConfigsTable {
    path: string;
    name?: string;
    component?: RouteComponent;
    redirect?: string;
    meta?: {
      title: string;
      icon?: string | FunctionalComponent | IconifyIcon;
      showLink?: boolean;
      rank?: number;
    };
    children?: Array<RouteChildrenConfigsTable>;
  }
}

// https://router.vuejs.org/zh/guide/advanced/meta.html#typescript
declare module "vue-router" {
  interface RouteMeta extends CustomizeRouteMeta {}
}
