<script setup lang="ts">
import { onMounted, ref } from "vue";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    imei: ""
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}


defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="150px"
  >
    <el-form-item label="Device IMEI">
      <el-input
        v-model="newFormInline.imei"
        clearable
        placeholder="Please enter device IMEI"
      />
    </el-form-item>
  </el-form>
</template>
