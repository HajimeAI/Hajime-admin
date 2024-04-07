export default {
  path: "/indexed",
  meta: {
    icon: "ep:histogram",
    title: "Index",
    rank: 2
  },
  redirect: "/indexed/index",
  children: [
    {
      path: "/indexed/index",
      name: "Indexed",
      component: () => import("@/views/indexed/index.vue"),
      meta: {
        title: "Index Library"
      }
    }
  ]
} satisfies RouteConfigsTable;;
