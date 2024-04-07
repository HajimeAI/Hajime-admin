

interface FormItemProps {
  id: string;
  /** indexed Name */
  nid: string;
  content: any; //状态
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
