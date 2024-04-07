<script setup lang="ts">
import { ref, Ref } from "vue";
import { useRole } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
// import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Delete from "@iconify-icons/ep/delete";
import InfoFilled from "@iconify-icons/ep/info-filled";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { type DeviceDetail } from "./utils/types";
import dayjs from "dayjs";

defineOptions({
  name: "my devices"
});

const formRef = ref();
const {
  form,
  loading,
  columns,
  dataList,
  indexList,
  pagination,
  // buttonClass,
  onSearch,
  resetForm,
  openDialog,
  // handleMenu,
  handleDelete,
  // handleDatabase,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange
} = useRole();

const showStatus = ref(false)
const deviceInfo: Ref<DeviceDetail> = ref()
const showDialog = (row) => {
  showStatus.value = true;
  deviceInfo.value = JSON.parse(row.detail)
}
</script>

<template>
  <div class="main">
    <el-form ref="formRef" :inline="true" :model="form" class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]">
      <el-form-item label="Device IMEI" prop="imei">
        <el-input v-model="form.imei" placeholder="Please enter device imei" clearable class="!w-[200px]" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :icon="useRenderIcon(Search)" :loading="loading" @click="onSearch">
          Search
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          Reset
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="Device List" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button type="primary" :icon="useRenderIcon(AddFill)" @click="openDialog()">
          Add
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table stripe border align-whole="center" showOverflowTooltip table-layout="auto" :loading="loading"
          :size="size" :data="dataList" :columns="dynamicColumns" :pagination="pagination"
          :paginationSmall="size === 'small' ? true : false" :header-cell-style="{
      background: 'var(--el-table-row-hover-bg-color)',
      color: 'var(--el-text-color-primary)'
    }" @selection-change="handleSelectionChange" @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange">
          <template #healthy="{ row }">
            <el-tag :type="Number(row.healthy) ? 'success' : 'danger'">{{
              Number(row.healthy) ? "Runing" : "Offline"
              }}</el-tag>
          </template>
          <template #type="{ row }">
            <el-tag :type="row.type ? 'warning' : 'success'">
              {{
              indexList.find(o => o.id == row.type)?.name || 'Super Node'
              }}
            </el-tag>
          </template>
          <template #createTime="{ row }">
            {{ dayjs(row.createTime).format("YYYY/MM/DD HH:mm:ss") }}
          </template>
          <template #updateTime="{ row }">
            {{ dayjs(row.updateTime).format("YYYY/MM/DD HH:mm:ss") }}
          </template>
          <template #operation="{ row }">
            <el-button class="reset-margin" link type="primary" :size="size" :icon="useRenderIcon(InfoFilled)"
              @click="showDialog(row)">
              Details
            </el-button>
            <!-- <el-popconfirm :title="`Are you sure to delete the data with device ${row.id}?`"
              @confirm="handleDelete(row)">
              <template #reference>
                <el-button class="reset-margin" link type="primary" :size="size" :icon="useRenderIcon(Delete)">
                  Delete
                </el-button>
              </template>
</el-popconfirm> -->
          </template>
        </pure-table>
      </template>
    </PureTableBar>
    <el-dialog v-model="showStatus" title="Device Details" width="40%">
      <div class="hw_info_container">
        <div class="title">hardware information</div>
        <div class="hw_info">
          <el-row :gutter="20" justify="center">
            <el-col :span="12">
              <div>
                <span>CPU:</span> {{ deviceInfo?.hw_info!.cpu }}
              </div>
            </el-col>
            <el-col :span="12">
              <div>
                <span>GPU:</span> {{ deviceInfo?.hw_info!.gpu_name }}
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" justify="center">
            <el-col :span="12">
              <div>
                <span>Memory Size:</span> {{ deviceInfo?.hw_info!.mem_size }}
              </div>
            </el-col>
            <el-col :span="12">
              <div>
                <span>Memory use:</span> {{ deviceInfo?.hw_info!.mem_pcnt }}
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" justify="center">
            <el-col :span="12">
              <div>
                <span>harddisk Size:</span>{{ deviceInfo?.hw_info!.hd_size }}
              </div>
            </el-col>
            <el-col :span="12">
              <div>
                <span>harddisk use:</span> {{ deviceInfo?.hw_info!.hd_pcnt }}
              </div>
            </el-col>
          </el-row>
          <el-row :gutter="20" justify="center">
            <el-col :span="8">
              <div :class="[deviceInfo?.compute_cap.stt ? 'select' : '', 'cap']">
                STT
              </div>
            </el-col>
            <el-col :span="8">
              <div :class="[deviceInfo?.compute_cap.tts ? 'select' : '', 'cap']">
                TTS
              </div>
            </el-col>
            <el-col :span="8">
              <div :class="[deviceInfo?.compute_cap.llm ? 'select' : '', 'cap']">
                LLM
              </div>
            </el-col>
          </el-row>
        </div>

      </div>
      <div class="hw_info_container">
        <div class="title">Available AI module information</div>
        <div class="hw_ai_info">
          <div class="item" v-for="item in deviceInfo?.compute_cap.ai_modules" :key=item>{{ item }}</div>
        </div>


      </div>

    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}

.hw_info_container {
  .title {
    font-size: 16px;
    font-weight: bold;
    padding: 10px 0;
  }

  .hw_info {
    border: 2px solid #9d8c8c;
    padding: 15px 10px;

    .cap {
      margin-top: 20px;
      background: #434443;
      color: #FFF;
      padding: 5px 10px;
      display: flex;
      justify-content: center;
    }

    .select {
      background: #086c26;
    }

  }

  .hw_ai_info {
    border: 2px solid #9d8c8c;
    padding: 15px 10px;
    display: flex;
    justify-content: flex-start;

    .item {
      border-radius: 5px;
      background: #086c26;
      color: #FFF;
      padding: 5px 10px;
      margin-right: 8px;
    }
  }
}
</style>
