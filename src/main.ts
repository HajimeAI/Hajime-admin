import App from "./App.vue";
import router from "./router";
import {setupStore} from "@/store";
import {useI18n} from "@/plugins/i18n";
import {getPlatformConfig} from "./config";
import {MotionPlugin} from "@vueuse/motion";
// import { useEcharts } from "@/plugins/echarts";
import {createApp, type Directive} from "vue";
import {useElementPlus} from "@/plugins/elementPlus";
import {injectResponsiveStorage} from "@/utils/responsive";

import Table from "@pureadmin/table";
// import PureDescriptions from "@pureadmin/descriptions";
import "./style/reset.scss";
import "./style/index.scss";
import "./style/tailwind.css";
import "element-plus/dist/index.css";
import "./assets/iconfont/iconfont.js";
import "./assets/iconfont/iconfont.css";

//wallet setting
import SolanaWallets from "solana-wallets-vue";

// You can either import the default styles or create your own.
import "solana-wallets-vue/styles.css";

import {PhantomWalletAdapter, SolflareWalletAdapter} from "@solana/wallet-adapter-wallets";
import * as directives from "@/directives";
import {FontIcon, IconifyIconOffline, IconifyIconOnline} from "./components/ReIcon";
import {Auth} from "@/components/ReAuth";
import VueTippy from "vue-tippy";

const walletOptions = {
  wallets: [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter()
  ],
  autoConnect: true
};

const app = createApp(App);

Object.keys(directives).forEach(key => {
  app.directive(key, (directives as { [key: string]: Directive })[key]);
});

app.component("IconifyIconOffline", IconifyIconOffline);
app.component("IconifyIconOnline", IconifyIconOnline);
app.component("FontIcon", FontIcon);

app.component("Auth", Auth);

app.use(VueTippy);
getPlatformConfig(app).then(async config => {
  setupStore(app);
  app.use(router);
  await router.isReady();
  injectResponsiveStorage(app, config);
  app.use(MotionPlugin).use(useI18n).use(useElementPlus).use(Table);
  app.use(SolanaWallets, walletOptions);
  // .use(PureDescriptions)
  // .use(useEcharts);
  app.mount("#app");
});

