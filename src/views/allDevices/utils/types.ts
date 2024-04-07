
interface FormItemProps {
  id: string;
  name: string;
  desc: string;
  healthy: number;
  type: string;
}
interface FormProps {
  formInline: FormItemProps;
}

interface DeviceDetail {
  imei: string;
  hw_info: HwInfo;
  compute_cap_level: number;
  compute_cap: ComputeCap;
}

interface HwInfo {
  cpu: string;
  mem_size: string;
  mem_pcnt: string;
  hd_size: string;
  hd_pcnt: string;
  gpu_name: string;
}

interface ComputeCap {
  stt: string;
  tts: string;
  llm: string;
  ai_modules: Array<string>;
}

export type { FormItemProps, FormProps, DeviceDetail };
