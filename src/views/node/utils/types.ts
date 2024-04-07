

interface FormItemProps {
  id: string,
  name: string,
  desc: string,
  healthy: number,
  type: string
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
