export default {
  path: "/devices",
  name: "devices",
  meta: {
    icon: "ep:monitor",
    title: "devices",
    rank: 1
  },
  redirect: "/devices/my",
  children: [
    {
      path: "/devices/my",
      name: "my device",
      component: () => import("@/views/myDevices/index.vue"),
      meta: {
        title: "My Devices"
      }
    }
  ]
} satisfies RouteConfigsTable;
