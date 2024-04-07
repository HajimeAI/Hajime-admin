import { reactive } from "vue";
import type { FormRules } from "element-plus";

/** Custom form rule validation */
export const formRules = reactive(<FormRules>{
  nid: [{ required: true, message: "The index library cannot be empty", trigger: "blur" }]
});
