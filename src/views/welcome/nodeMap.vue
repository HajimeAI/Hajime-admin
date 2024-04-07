<template>
  <div class="flex">
    <div ref="networkContainer" class="h-[750px] w-2/3" />
    <div class="w-1/3 bg-[#000]">
      <el-scrollbar ref="scrollbarRef" height="750px" @scroll="scroll">
        <div ref="innerRef" class="log-container">
          <p
            v-for="(item, index) in list"
            :key="item"
            class="scrollbar-demo-item"
            @click="handleReDraw(item)"
          >
            {{ `${index}:` }} {{ item }}
          </p>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick, reactive } from "vue";
import { ElMessage } from "element-plus";
import {
  visOptions,
  onlineStyle,
  offlineStyle,
  primaryColor,
  substrLength,
  showTimes,
  lightFontColor
} from "@/config/vis-network";
import { getNodeList } from "@/api/nodeMap";

// vis-network container
const networkContainer = ref<HTMLDivElement | null>(null);
// vis-network instance
let network = null;
const scrollbarRef = ref(null);
// vis-network nodes
let visNodes = reactive([]);
// vis-networ edges
let visEdges = reactive([]);
// message set
const list = ref([]);
// flash array
const messageQueue = ref([]);
// flash finsing
const flashing = ref(false);
// websocket
const socket = ref();

const scroll = ({ scrollTop }) => {
  console.log("scrollTop", scrollTop);
};

const scrollToBottom = () => {
  nextTick(() => {
    const container = scrollbarRef.value?.$el.querySelector(
      ".el-scrollbar__wrap"
    );
    container.scrollTop = container.scrollHeight;
  });
};

onMounted(() => {
  initWebsocket();
  initializeNetwork();
});
// 处理ws消息
const handleMessage = data => {
  const jsonData = JSON.parse(data);
  list.value.push(jsonData);
  // Find the corresponding function for this kind from the kinds and execute it.
  const obj = kinds.find(item => item.kind == jsonData.kind);
  if (obj) {
    obj.function(jsonData);
  }
  nextTick(() => {
    scrollToBottom();
  });
};

const initWebsocket = () => {
  socket.value = new WebSocket(import.meta.env.VITE_WS_NODE_ADDRESS);
  socket.value.onopen = () => {
    scrollToBottom();
  };
  socket.value.onmessage = (msg: any) => {
    if (msg.data == "websocket connection success...") return;
    const { data } = msg;
    handleMessage(data);
  };
  socket.value.onclose = (msg: any) => {
    console.log(msg);
  };
  socket.value.onerror = (msg: any) => {
    console.log(msg);
  };
};

const handleReDraw = items => {
  const obj = kinds.find(item => item.kind == items.kind);
  if (obj) {
    obj.function(items);
  }
};

const convertData = data => {
  if (!data.length) return [];
  return data.map(item => {
    return {
      id: item.imei,
      label: `${item.name}\n(${item.ip})`,
      flash: false //
    };
  });
};


//
const initializeNetwork = async () => {
  const { code, data, msg } = await getNodeList();
  if (code !== 200) return ElMessage.error(msg);
  const nodesData = convertData(data);
  visNodes.push(...nodesData);
  const container = networkContainer.value;
  if (!container) return;
  const nodes = new vis.DataSet(visNodes);
  const edges = new vis.DataSet(visEdges);
  const visData = { nodes, edges };
  const options = visOptions;
  network = new vis.Network(container, visData, options);
  const runningNodes = data.filter(item => item.healthy == 1);
  const stopingNodes = data.filter(item => item.healthy == 0);
  if (runningNodes.length) {
    runningNodes.forEach(item => {
      onDeviceOnline({
        kind: "device_online",
        node_id: item.imei,
        flash: false
      });
    });
  }
  if (stopingNodes.length) {
    stopingNodes.forEach(item => {
      onDeviceOnline({
        kind: "device_offline",
        node_id: item.imei,
        flash: false
      });
    });
  }
  network.moveTo({
    scale: 0.8,
    position: {
      x: 0,
      y: 0
    },
    animation: true,
    easingFunction: "easeeinoutquint"
  });
};

const addEdges = ({ from, to, text = "" }) => {
  if (text) {
    text =
      text.length > substrLength ? text.slice(0, substrLength) + "..." : text;
  }
  const nodes = network?.body.data.nodes;
  if (!nodes) return;
  const fromNode = nodes.get(from);
  const toNode = nodes.get(to);
  if (!fromNode || !toNode) return;
  network?.body.data.edges.add({
    from: fromNode.id,
    to: toNode.id,
    label: text
  });
  setTimeout(() => {
    removeEdges({ formId: fromNode.id, toId: toNode.id });
  }, showTimes);
};
const removeEdges = ({ formId, toId }) => {
  const edges = network?.body.data.edges;
  if (!edges) return;
  const edgeId = edges.getIds({
    filter: edge => edge.from === formId && edge.to === toId
  })[0];
  edges.remove(edgeId);
};

const onDeviceOnline = ({ kind, node_id, flash = true }) => {
  const nodes = network?.body.data.nodes;
  if (!nodes) return;
  const node = nodes.get(node_id);
  if (node) {
    if (kind === "device_online") {
      node.color = onlineStyle.color;
      node.font = onlineStyle.font;
    } else if (kind === "device_offline") {
      node.color = offlineStyle.color;
      node.font = offlineStyle.font;
    }
    nodes.update(node);
    if (flash) flashNode(node_id);
  }
};

const onP2PConnected = ({ kind, node_id, content }) => {
  if (kind !== "p2p_connected") return;
  const nodes = network?.body.data.nodes;
  if (!nodes) return;
  const node = nodes.get(node_id);
  if (node) {
    ElMessage({
      message: `${node.label} connected ${content}`,
      type: "success",
      offset: 100
    });
    const ipv4Reg = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
    const ipv4 = ipv4Reg.exec(node.label);
    if (ipv4) {
      node.label = node.label.replace(ipv4[0], content);
    } else {
      node.label = `${node.label}\n(${content})`;
    }
    nodes.update(node);
    flashNode(node_id);
  }
};

const onModelLoaded = ({ kind, node_id, content }) => {
  if (kind !== "model_online") return;
  const nodes = network?.body.data.nodes;
  if (!nodes) return;
  const node = nodes.get(node_id);
  ElMessage({
    message: `${content.text}`,
    type: "success",
    offset: 100
  });
  flashNode(node_id);
};

const onSendFileToNode = ({ kind, node_id, content }) => {
  if (kind !== "send_file_to_node") return;
  const nodes = network?.body.data.nodes;
  if (!nodes) return;
  const node = nodes.get(node_id);
  addEdges({
    from: content.from_node,
    to: content.to_node,
    text: content.text
  });
  ElMessage({
    message: `${content.text}`,
    type: "success",
    offset: 100
  });
  flashNode(node_id);
};

const onFileEmbedding = ({ kind, node_id, content }) => {
  if (kind !== "file_embedding") return;
  const nodes = network?.body.data.nodes;
  if (!nodes) return;
  const node = nodes.get(node_id);
  ElMessage({
    message: `${content.text}`,
    type: "success",
    offset: 100
  });
  flashNode(node_id);
};

const onASR = ({ kind, node_id, content }) => {
  if (kind !== "asr") return;
  const nodes = network?.body.data.nodes;
  if (!nodes) return;
  ElMessage({
    message: `${content.text}`,
    type: "success",
    offset: 100
  });
  flashNode(node_id);
};

const onQueryVectorDB = ({ kind, node_id, content }) => {
  if (kind == "query_vector_db" || kind == "vector_db_response") {
    addEdges({
      from: content.from_node,
      to: content.to_node,
      text: content.text
    });
    flashNode(node_id);
  } else {
    return;
  }
};

const onLLMService = ({ kind, node_id, content }) => {
  if (kind != "llm_service") return;
  const nodes = network?.body.data.nodes;
  if (!nodes) return;
  ElMessage({
    message: `${content.text}`,
    type: "success",
    offset: 100
  });
  flashNode(node_id);
};

const onTTS = ({ kind, node_id, content }) => {
  if (kind != "tts") return;
  const nodes = network?.body.data.nodes;
  if (!nodes) return;
  ElMessage({
    message: `${content.text}`,
    type: "success",
    offset: 100
  });
  flashNode(node_id);
};

// 存证返回
const onEvidence = ({ kind, node_id, content }) => {
  if (kind != "evidence") return;
  const nodes = network?.body.data.nodes;
  if (!nodes) return;
  ElMessage({
    message: `${content.text}`,
    type: "success",
    offset: 100
  });
  flashNode(node_id);
};

const flashAnimation = nodeId => {
  const nodes = network?.body.data.nodes;
  if (!nodes) return;
  const firstId = nodeId;
  const node = nodes.get(firstId);
  const originalColor = node.color;
  const originalFont = node.font;
  return new Promise<void>(resolve => {
    const node = nodes.get(firstId);
    node.color = {
      background: primaryColor,
      border: primaryColor
    };
    node.font = { color: lightFontColor };
    nodes.update(node);
    setTimeout(() => {
      node.color = originalColor;
      node.font = originalFont;
      nodes.update(node);
      resolve();
    }, showTimes);
  });
};

const startFlashing = () => {
  if (messageQueue.value.length > 0) {
    flashing.value = true;
    const nodeId = messageQueue.value.shift();
    flashBox(nodeId);
  }
};
const flashBox = nodeId => {
  flashAnimation(nodeId).then(() => {
    flashing.value = false;
    startFlashing();
  });
};

const flashNode = nodeId => {
  const isExist = messageQueue.value.includes(nodeId);
  if (isExist) return;
  messageQueue.value.push(nodeId);
  if (!flashing.value) {
    startFlashing();
  }
};


const generateResponse = () => {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  let result = "";

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * letters.length);
    const randomLetter = letters[randomIndex];
    result += randomLetter;
  }

  return result;
};
const generateKind = () => {
  return kinds[Math.floor(Math.random() * kinds.length)].kind;
};

/**
 */
const generateNodeId = () => {
  return Math.floor(Math.random() * 5) + 1;
};
const generateFromTo = () => {
  const from = generateNodeId();
  let to = generateNodeId();
  while (to === from) {
    to = generateNodeId();
  }
  return { from, to };
};

const generateIp = () => {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

// ---------------------------------------
const generateDeviceOnlineMessage = () => {
  const kind = "device_online";
  const node_id = generateNodeId();
  return { kind, node_id };
};
const generateDeviceOfflineMessage = () => {
  const kind = "device_offline";
  const node_id = generateNodeId();
  return { kind, node_id };
};
const generateP2PConnectedMessage = () => {
  const kind = "p2p_connected";
  const node_id = generateNodeId();
  const content = generateIp();
  return { kind, node_id, content };
};
const generateModelLoadedMessage = () => {
  const kind = "model_online";
  const node_id = generateNodeId();
  return { kind, node_id };
};

const generateSendFileToNodeMessage = () => {
  const kind = "send_file_to_node";
  const node_id = generateNodeId();
  const content = {
    from_node: node_id,
    to_node: generateNodeId(),
    text: "test.pdf"
  };
  return { kind, node_id, content };
};
const generateFileEmbeddingMessage = () => {
  const kind = "file_embedding";
  const node_id = generateNodeId();
  const content = {
    text: "test.pdf"
  };
  return { kind, node_id, content };
};
const generateASRMessage = () => {
  const kind = "asr";
  const node_id = generateNodeId();
  const content = {
    text: "hello world"
  };
  return { kind, node_id, content };
};
const generateQueryVectorDBMessage = () => {
  const kind = Math.random() > 0.5 ? "query_vector_db" : "vector_db_response";
  const node_id = generateNodeId();
  const { to } = generateFromTo();
  const content = {
    from_node: node_id,
    to_node: to,
    text: generateResponse()
  };
  return { kind, node_id, content };
};
const generateLLMServiceMessage = () => {
  const kind = "llm_service";
  const node_id = generateNodeId();
  const content = {
    text: "request succ"
  };
  return { kind, node_id, content };
};

const generateTTSMessage = () => {
  const kind = "tts";
  const node_id = generateNodeId();
  const content = {
    text: "tts success"
  };
  return { kind, node_id, content };
};

const mock = () => {
  const kind = generateKind();
  const { function: func, mockfunc } = kinds.find(item => item.kind == kind);
  if (!mockfunc) return;
  const data = mockfunc();

  list.value.push(data);
  scrollToBottom();
  func(data);
};

const kinds = [
  {
    kind: "device_online",
    function: onDeviceOnline,
    mockfunc: generateDeviceOnlineMessage
  },
  {
    kind: "device_offline",
    function: onDeviceOnline,
    mockfunc: generateDeviceOfflineMessage
  },
  {
    kind: "p2p_connected",
    function: onP2PConnected,
    mockfunc: generateP2PConnectedMessage
  },
  {
    kind: "model_online",
    function: onModelLoaded,
    mockfunc: generateModelLoadedMessage
  },
  {
    kind: "send_file_to_node",
    function: onSendFileToNode,
    mockfunc: generateSendFileToNodeMessage
  },
  {
    kind: "file_embedding",
    function: onFileEmbedding,
    mockfunc: generateFileEmbeddingMessage
  },
  {
    kind: "asr",
    function: onASR,
    mockfunc: generateASRMessage
  },
  {
    kind: "query_vector_db",
    function: onQueryVectorDB,
    mockfunc: generateQueryVectorDBMessage
  },
  {
    kind: "vector_db_response",
    function: onQueryVectorDB,
    mockfunc: generateQueryVectorDBMessage
  },
  {
    kind: "llm_service",
    function: onLLMService,
    mockfunc: generateLLMServiceMessage
  },
  {
    kind: "tts",
    function: onTTS,
    mockfunc: generateTTSMessage
  },
  {
    kind: "evidence",
    function: onEvidence
  }
];
</script>

<style scoped>
.log-container {
  background: #000;
  padding: 5px 0;
}

.scrollbar-demo-item {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin: 10px;
  text-align: left;
  border-radius: 4px;
  background: #000;
  color: #fff;
}

.el-slider {
  margin-top: 20px;
}
</style>
