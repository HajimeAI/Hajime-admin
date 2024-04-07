export default {
  path: "/nodeSend",
  meta: {
    icon: "ep:message",
    title: "knowledge",
    rank: 3,
  },
  redirect: "/nodeSend/index",
  children: [
    {
      path: "/nodeSend/index",
      name: "NodeSend",
      component: () => import("@/views/nodeSend/index.vue"),
      meta: {
        title: "Knowledge"
      }
    }
  ]
} satisfies RouteConfigsTable;;
