import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({
  // Animation method
  easing: "ease",
  // Increasing the speed of the bar
  speed: 500,
  // Whether or not to display the loaded ICO
  showSpinner: false,
  // Automatically increment intervals
  trickleSpeed: 200,
  // The minimum percentage at initialization
  minimum: 0.3
});

export default NProgress;
