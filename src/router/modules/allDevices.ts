export default {
  path: "/devices",
  name: "all devices",
  meta: {
    icon: "ep:monitor",
    title: "devices",
    rank: 1,
    showLink: false
  },
  redirect: "/devices/all",
  children: [
    {
      path: "/devices/all",
      name: "all devices",
      component: () => import("@/views/allDevices/index.vue"),
      meta: {
        title: "All Devices"
      }
    }
  ]
} satisfies RouteConfigsTable;
