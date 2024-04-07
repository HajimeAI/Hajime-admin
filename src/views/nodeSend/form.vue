<script setup lang="ts">
import { onMounted, ref } from "vue";
import { formRules } from "./utils/rule";
import { FormProps } from "./utils/types";
import { ElMessage } from 'element-plus'
import { Plus,UploadFilled } from '@element-plus/icons-vue'
import { useRole } from "./utils/hook";

const { indexList } = useRole();

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    id: "",
    nid: "", //indexed Name
    content: ""
  })
});

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

const uploadUrl = ref("")

onMounted(() => {
  uploadUrl.value = "/api/indexedVo/upload"
})

defineExpose({ getRef });

import type { UploadProps } from 'element-plus'

const fileUrl = ref('')

const handleAvatarSuccess: UploadProps['onSuccess'] = (
  response,
  uploadFile
) => {
  fileUrl.value = URL.createObjectURL(uploadFile.raw!)
  newFormInline.value.content = uploadFile.response.data.fileUrl
}

const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
   if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error('The maximum file size cannot exceed 10MB!')
    return false
  }
  return true
}
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="150px"
  >
    <el-form-item label="Indexed Type" prop="nid">
       <el-select
      v-model="newFormInline.nid"
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
    <el-form-item label="Upload File">
          <el-upload
          drag
          class="avatar-uploader"
          :action="uploadUrl"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            Drag the file here or click to upload
          </div>
          <template #tip>
          <div class="el-upload__tip">
            File size does not exceed 10MB
          </div>
        </template>
      </el-upload>
    </el-form-item>
  </el-form>
</template>
<style scoped>
.avatar-uploader .avatar {
  /* width: 150px;
  height: 150px;
  display: block; */
}
</style>

<style>
.avatar-uploader .el-upload {
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon--upload {
  font-size: 80px;
  color: #8c939d;
  padding: 30px 30px;
  width: 178px;
  /* height: 178px; */
  text-align: center;
}
.el-upload__text {
  font-size: 12px;
  padding: 5px 8px;
  display: flex;
}
</style>
