import editForm from "../form.vue";
import uploadForm from "../uploadFrom.vue";
import { message } from "@/utils/message";
import { getNodeList, create, edit, del } from "@/api/node";
import { getIndexListAll } from "@/api/indexed";
import { addDialog } from "@/components/ReDialog";
import { type FormItemProps } from "../utils/types";
import { type PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted, h, toRaw } from "vue";
import qs from "qs"

export function useRole() {
  const form = reactive({
    name: ""
  });
  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "ID",
      prop: "id",
      minWidth: 100
    },
    {
      label: "IMEI",
      prop: "imei",
      minWidth: 120
    },
    {
      label: "IP",
      prop: "ip",
      minWidth: 120
    },
    {
      label: "Healthy",
      prop: "healthy",
      slot: "healthy",
      minWidth: 120
    },
    {
      label: "Desc",
      prop: "desc",
      minWidth: 150
    },
    {
      label: "Type",
      prop: "type",
      slot: "type",
      minWidth: 80
    },
    {
      label: "CreateTime",
      prop: "createTime",
      minWidth: 120
    },
    {
      label: "UpdateTime",
      prop: "updateTime",
      minWidth: 120
    },
    {
      label: "Operation",
      fixed: "right",
      width: 240,
      slot: "operation"
    }
  ];
  // const buttonClass = computed(() => {
  //   return [
  //     "!h-[20px]",
  //     "reset-margin",
  //     "!text-gray-500",
  //     "dark:!text-white",
  //     "dark:hover:!text-primary"
  //   ];
  // });
  function handleDelete(row) {
    del(row);
    message(`delete ${row.name} data?`, { type: "success" });
    onSearch();
  }

  async function handleSizeChange(val: number) {
    onSearch()
    console.log(`current page: ${val}`);
  }

  function handleCurrentChange(val: number) {
    onSearch()
    console.log(`current page: ${val}`);
  }

  function handleSelectionChange(val) {
    onSearch()
    console.log("handleSelectionChange", val);
  }

  async function onSearch() {
    loading.value = true;
    const { data } = await getNodeList({
      data: toRaw(form),
      pageNumber: pagination.currentPage,
      pageSize: pagination.pageSize,
    });
    dataList.value = data.records;
    console.log("dataList", dataList.value);
    pagination.total = data.totalRow;
    pagination.pageSize = data.pageSize;
    pagination.currentPage = data.pageNumber;

    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  function openDialog(title = "Add", row?: FormItemProps) {
    addDialog({
      title: `${title} Device`,
      props: {
        formInline: {
          id: row?.id || "",
          name: row?.name || "",
          desc: row?.desc || "",
          healthy: row?.healthy || 0,
          type: Number(row?.type) || ""
        }
      },
      width: "40%",
      draggable: true,
      // fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(`${title} id ${curData.id} data`, {
            type: "success"
          });
          done(); // Close the pop-up box
          onSearch(); // Refresh table data
        }
        FormRef.validate(valid => {
          if (valid) {
            // The form rule is verified
            if (title === "Add") {
              create(curData);
              chores();
            } else {
              edit(curData);
              chores();
            }
            onSearch(); //Refresh table data
          }
        });
      }
    });
  }
 /** Menu Permissions */
  function handleMenu() {
  }

  const indexList = ref([])
  onMounted(() => {
    onSearch();
    getIndexListAll().then(res => {
      console.log("getIndexListAll", res)
      indexList.value = res.data
    })
  });

  return {
    form,
    loading,
    columns,
    dataList,
    pagination,
    indexList,
    // buttonClass,
    onSearch,
    resetForm,
    openDialog,
    handleMenu,
    handleDelete,
    // handleDatabase,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
