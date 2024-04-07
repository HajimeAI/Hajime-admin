import { $t } from "@/plugins/i18n";
const { VITE_HIDE_HOME } = import.meta.env;
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/log",
  name: "Log",
  component: Layout,
  redirect: "/log/trace",
  meta: {
    icon: "ep:camera",
    title: "Log Trace",
    rank: 4
  },
  children: [
    {
      path: "/log/trace",
      name: "log trace",
      component: () => import("@/views/welcome/log.vue"),
      meta: {
        title: "Log Trace",
        showLink: VITE_HIDE_HOME === "true" ? false : true
      }
    }
  ]
} satisfies RouteConfigsTable;
