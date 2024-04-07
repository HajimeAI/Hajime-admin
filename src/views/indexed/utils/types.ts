
interface FormItemProps {
  id: string;
  /** name */
  name: string;
  /** desc */
  desc: string;
  enable: number;
}
interface FormProps {
  formInline: FormItemProps;
}


export type { FormItemProps, FormProps };
