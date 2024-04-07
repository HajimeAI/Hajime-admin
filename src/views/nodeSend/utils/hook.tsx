import editForm from "../form.vue";
import { message } from "@/utils/message";
import { getNodeList, create, edit, del, send } from "@/api/node_send";
import { getIndexListAll } from "@/api/indexed";
import { addDialog } from "@/components/ReDialog";
import { type FormItemProps } from "../utils/types";
import { type PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted, h, toRaw } from "vue";

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
      minWidth: 80
    },
    {
      label: "Indexed Name",
      prop: "nid",
      slot: "status",
      minWidth: 80
    },
    {
      label: "Content",
      prop: "content",
      minWidth: 120
    },
    {
      label: "CreateTime",
      prop: "createTime",
      slot: "createTime",
      minWidth: 120
    },
    {
      label: "UpdateTime",
      prop: "updateTime",
      slot: "updateTime",
      minWidth: 120
    },
    {
      label: "operation",
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
    del(row).then(res => {
      message(`You deleted the data ${row.id}`, { type: "success" });
      onSearch();
    })
  }
  function handleSend(row) {
    send(row).then(() => {
      message(`send file success ${row.id}`, { type: "success" });
      onSearch();
    })
  }

  function handleSizeChange(val: number) {
    onSearch()
    console.log(`${val} items per page`);
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

  function openDialog(title = "Upload", row?: FormItemProps) {
    addDialog({
      title: `${title} File`,
      props: {
        formInline: {
          id: row?.id || "",
          nid: row?.nid || "",
          content: row?.content || ""
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
          message(`You ${title} this piece of data with the index library name ${curData.name}`, {
            type: "success"
          });
          done(); // Close the pop-up box
          onSearch(); // Refresh table data
        }
        FormRef.validate(valid => {
          create(curData).then(res => {
            chores();
          });
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
      // console.log(res)
      indexList.value = res.data
    })
  });

  return {
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
    handleMenu,
    handleDelete,
    handleSend,
    // handleDatabase,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
