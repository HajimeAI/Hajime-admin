<script setup lang="ts">
import { onMounted, ref } from "vue";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { getIndexListAll } from "@/api/indexed";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    id: "",
    name: "",
    desc: "",
    healthy: 0,
    type:""
  })
});
const indexList  = ref([])

onMounted(async () => {
  const { data } = await getIndexListAll();
  indexList.value = data;
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

const healthyList = [{
  id: 1,
  label: "Runing"
},{
  id: 0,
  label: "offline"
  }]


defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="150px"
  >
    <el-form-item label="Device Name">
      <el-input
        v-model="newFormInline.name"
        clearable
        placeholder="Please enter device name"
      />
    </el-form-item>

    <el-form-item label="Desc" prop="desc">
      <el-input
        v-model="newFormInline.desc"
        clearable
        placeholder="Please enter description information"
      />
    </el-form-item>
    <el-form-item label="status" prop="healthy">
      <el-select
      v-model="newFormInline.healthy"
      placeholder="status"
    >
      <el-option
        v-for="item in healthyList"
        :key="item.id"
        :label="item.label"
        :value="item.id"
      />
    </el-select>
    </el-form-item>
    <el-form-item label="Indexed Type">
      <el-select
      v-model="newFormInline.type"
      placeholder="Indexed Type"
    >
      <el-option
        v-for="item in indexList"
        :key="item.id"
        :label="item.name"
        :value="item.id"
      />
    </el-select>
    </el-form-item>
  </el-form>
</template>
