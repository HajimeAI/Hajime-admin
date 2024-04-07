<template>
  <div>
    <el-form ref="formRef" :inline="true" :model="form" class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
      <el-form-item label="Content:" prop="name">
        <el-input v-model="form.name" placeholder="Please enter content" clearable class="!w-[200px]" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon(Search)" @click="onSearch">
          Search
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          Reset
        </el-button>
      </el-form-item>
    </el-form>
    <el-scrollbar ref="scrollbarRef" height="500px" always @scroll="scroll">
      <div ref="innerRef" class="log-container">
        <p v-for="(item, index) in list" :key="item" class="scrollbar-demo-item">
          {{ `${index}:` }} {{ item }}
        </p>
      </div>
    </el-scrollbar>
  </div>

</template>

<script lang="ts" setup>
import { onMounted, ref, nextTick, onBeforeUnmount, reactive } from 'vue'
import { ElScrollbar } from 'element-plus'
import { getList, ModelResult } from '@/api/log'
import { instanceOf } from 'vue-types';
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
const socket = ref()
const max = ref(0)
const value = ref(0)
const innerRef = ref<HTMLDivElement>()
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()

const list = ref([])
const allList = ref([])
const timers = ref()

const initWebsocket = () => {
  socket.value = new WebSocket(import.meta.env.VITE_WS_ADDRESS);
  socket.value.onopen = () => {
    console.log('WebSocket connected');
    getData()
  };
  socket.value.onmessage = (msg: any) => {
    if (msg.data == "websocket connection success...") {
      // list.value.unshift(msg.data)
    } else {
      // list.value.push(msg.data)
      allList.value.push(msg.data)
    }
    nextTick(() => {
      scrollbarRef.value!.setScrollTop(innerRef.value!.clientHeight)
    })
    console.log(msg)
  }
  socket.value.onclose = (msg: any) => {
    console.log(msg)
    // reconnect()
  }
  socket.value.onerror = (msg: any) => {
    console.log(msg)
    // reconnect()
  }
}
onMounted(() => {
  initWebsocket()
})
onBeforeUnmount(() => {
  console.log("onBeforeUnmount")
  clearInterval(timers.value)
})

type LogResult = {
  id: number;
  content: string;
}

const getData = () => {
  getList().then((res: ModelResult) => {
    res.data.map((o: LogResult) => {
      list.value.unshift(o.content)
    })
    allList.value = list.value
    nextTick(() => {
      scrollbarRef.value!.setScrollTop(innerRef.value!.clientHeight)
    })
  })
}

const scroll = ({ scrollTop }) => {
  console.log("scrollTop", scrollTop)
}

const form = reactive({
  name: ""
});

const formRef = ref()

const onSearch = () => {
  list.value = allList.value.filter(o => {
    return o.includes(form.name)
  })
}
const resetForm = formEl => {
  console.log(formEl)
  if (!formEl) return;
  formEl.resetFields();
  list.value = allList.value
};

const lockReconnect = ref(false)
const reconnect = () => {
  if (lockReconnect.value) return;
  lockReconnect.value = true;
  timers.value = setInterval(() => {
    console.info("Try reconnecting...");
    initWebsocket();
    lockReconnect.value = false;
  }, 5000);
}
</script>

<style scoped>
.log-container {
  background: #000;
  padding: 5px 0;
}

.scrollbar-demo-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 40px;
  margin: 10px;
  text-align: left;
  border-radius: 4px;
  background: #000;
  color: #FFF;
}

.el-slider {
  margin-top: 20px;
}
</style>
