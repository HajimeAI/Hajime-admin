<script setup lang="ts">
import { ref } from "vue";
import { useRole } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
// import { PureTable } from "@pureadmin/table";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";

defineOptions({
  name: "Task"
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
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="Device Name" prop="name">
        <el-input
          v-model="form.name"
          placeholder="Please enter device name"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="loading"
          @click="onSearch"
        >
          Search
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          Reset
        </el-button>
      </el-form-item>
    </el-form>

    <PureTableBar title="Device List" :columns="columns" @refresh="onSearch">
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog()"
        >
          Add
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          stripe
          border
          align-whole="center"
          showOverflowTooltip
          table-layout="auto"
          :loading="loading"
          :size="size"
          :data="dataList"
          :columns="dynamicColumns"
          :pagination="pagination"
          :paginationSmall="size === 'small' ? true : false"
          :header-cell-style="{
            background: 'var(--el-table-row-hover-bg-color)',
            color: 'var(--el-text-color-primary)'
          }"
          @selection-change="handleSelectionChange"
          @page-size-change="handleSizeChange"
          @page-current-change="handleCurrentChange"
        >
          <template #healthy="{ row }">
            <el-tag :type="Number(row.healthy) ? 'success' : 'danger'">{{
              Number(row.healthy) ? "Runing" : "Offline"
            }}</el-tag>
          </template>
        <template #type="{ row }">
            <el-tag type="warning">{{
              indexList.find(o => o.id == row.type)?.name
            }}</el-tag>
          </template>
          <template #variables="{ row }">
            {{ row.variables }}
          </template>
          <template #operation="{ row }">
            <el-button
              class="reset-margin"
              link
              type="primary"
              :size="size"
              :icon="useRenderIcon(EditPen)"
              @click="openDialog('Edit', row)"
            >
              Edit
            </el-button>
            <el-popconfirm
              :title="`Are you sure to delete the data with device ${row.id}?`"
              @confirm="handleDelete(row)"
            >
              <template #reference>
                <el-button
                  class="reset-margin"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon(Delete)"
                >
                  Delete
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </pure-table>
      </template>
    </PureTableBar>
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
</style>
