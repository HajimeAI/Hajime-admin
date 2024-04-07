import { ref } from "vue";
import reDialog from "./index.vue";
import { useTimeoutFn } from "@vueuse/core";
import { withInstall } from "@pureadmin/utils";
import type {
  EventType,
  ArgsType,
  DialogProps,
  ButtonProps,
  DialogOptions
} from "./type";

const dialogStore = ref<Array<DialogOptions>>([]);

const addDialog = (options: DialogOptions) => {
  const open = () =>
    dialogStore.value.push(Object.assign(options, { visible: true }));
  if (options?.openDelay) {
    useTimeoutFn(() => {
      open();
    }, options.openDelay);
  } else {
    open();
  }
};

/** Close the pop-up box */
const closeDialog = (options: DialogOptions, index: number, args?: any) => {
  dialogStore.value[index].visible = false;
  options.closeCallBack && options.closeCallBack({ options, index, args });
  useTimeoutFn(() => {
    dialogStore.value.splice(index, 1);
  }, 200);
};

/**
 * @description Modify the attribute value of the dialog box itself.
 * @param value The attribute value.
 * @param key The attribute, default is `title`.
 * @param index The index of the dialog box (default is `0`, representing a single dialog box. For nested dialog boxes, assign the index of the dialog box whose attribute value you want to change to `index`).
 *
 */
const updateDialog = (value: any, key = "title", index = 0) => {
  dialogStore.value[index][key] = value;
};

/** Close all dialog boxes.*/
const closeAllDialog = () => {
  dialogStore.value = [];
};

/**
 * https://github.com/pure-admin/vue-pure-admin/blob/main/src/App.vue#L4
 * https://github.com/pure-admin/vue-pure-admin/blob/main/src/App.vue#L13
 * https://github.com/pure-admin/vue-pure-admin/blob/main/src/App.vue#L20
 */
const ReDialog = withInstall(reDialog);

export type { EventType, ArgsType, DialogProps, ButtonProps, DialogOptions };
export {
  ReDialog,
  dialogStore,
  addDialog,
  closeDialog,
  updateDialog,
  closeAllDialog
};
