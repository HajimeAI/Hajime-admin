import { $t } from "@/plugins/i18n";
const { VITE_HIDE_HOME } = import.meta.env;
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/nodemap",
  name: "NodeMap",
  component: Layout,
  redirect: "/node/map",
  meta: {
    icon: "ep:map-location",
    title: "Node Map",
    rank: 4
  },
  children: [
    {
      path: "/node/map",
      name: "Node Map",
      component: () => import("@/views/welcome/nodeMap.vue"),
      meta: {
        title: "Node Map",
        showLink: VITE_HIDE_HOME === "true" ? false : true
      }
    }
  ]
} satisfies RouteConfigsTable;
