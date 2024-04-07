import type { VNode } from "vue";
import { isFunction } from "@pureadmin/utils";
import { type MessageHandler, ElMessage } from "element-plus";

type messageStyle = "el" | "antd";
type messageTypes = "info" | "success" | "warning" | "error";

interface MessageParams {
  /** Message type, optional 'info', 'success', 'warning', 'error', default 'info' */
  type?: messageTypes;
  /** Custom icon, which overrides the icon for 'type' */
  icon?: any;
  /** Whether to treat the 'message' attribute as an 'HTML' fragment, default 'false' */
  dangerouslyUseHTMLString?: boolean;
  /** Message style, optional 'el', 'antd', default 'antd' */
  customClass?: messageStyle;
  /** Displays the time in milliseconds. If you set it to '0', it will not turn off automatically, 'element-plus' will default to '3000', and the platform will be changed to default to '2000' */
  duration?: number;
  /** Whether to display a close button, default value 'false' */
  showClose?: boolean;
  /** Whether the text is centered or not, default value 'false' */
  center?: boolean;
  /** 'Message' offset from the top of the window, default '20' */
  offset?: number;
  /** Set the root element of the component, default 'document.body' */
  appendTo?: string | HTMLElement;
  /** Merge messages with the same content, messages of type 'VNode' are not supported, the default value is 'false' */
  grouping?: boolean;
  /** Callback function on closing, parameter is the closed 'message' instance */
  onClose?: Function | null;
}


/**
 * `Message`
 */
const message = (
  message: string | VNode | (() => VNode),
  params?: MessageParams
): MessageHandler => {
  if (!params) {
    return ElMessage({
      message,
      customClass: "pure-message"
    });
  } else {
    const {
      icon,
      type = "info",
      dangerouslyUseHTMLString = false,
      customClass = "antd",
      duration = 2000,
      showClose = false,
      center = false,
      offset = 20,
      appendTo = document.body,
      grouping = false,
      onClose
    } = params;

    return ElMessage({
      message,
      type,
      icon,
      dangerouslyUseHTMLString,
      duration,
      showClose,
      center,
      offset,
      appendTo,
      grouping,
      // 全局搜 pure-message 即可知道该类的样式位置
      customClass: customClass === "antd" ? "pure-message" : "",
      onClose: () => (isFunction(onClose) ? onClose() : null)
    });
  }
};

/**
 * closeAllMessage
 */
const closeAllMessage = (): void => ElMessage.closeAll();

export { message, closeAllMessage };
