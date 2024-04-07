<script setup lang="ts">
import { ref } from "vue";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    id: "",
    name: "",
    desc: "",
    enable: 1
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });

const enableOpt = [
  { key: 1, name: "Public" },
  { key: 0, name: "Private" }
];

</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="150px"
  >
    <el-form-item label="Name" prop="name">
      <el-input
        v-model="newFormInline.name"
        clearable
        placeholder="Please enter the index library name"
      />
    </el-form-item>

    <el-form-item label="Desc" prop="desc">
      <el-input
        v-model="newFormInline.desc"
        clearable
        placeholder="Please enter a description"
      />
    </el-form-item>
    <el-form-item label="Type">
      <el-select v-model="newFormInline.enable">
        <el-option
          v-for="(item, index) in enableOpt"
          :key="index"
          :label="item.name"
          :value="item.key"
        />
      </el-select>
    </el-form-item>
  </el-form>
</template>
