<script setup lang="ts">
import {useI18n} from "vue-i18n";
import Motion from "./utils/motion";
import {useRouter} from "vue-router";
import {message} from "@/utils/message";
import {loginRules} from "./utils/rule";
import {useNav} from "@/layout/hooks/useNav";
import type {FormInstance} from "element-plus";
import {$t, transformI18n} from "@/plugins/i18n";
import {useLayout} from "@/layout/hooks/useLayout";
import {useUserStoreHook} from "@/store/modules/user";
import {addPathMatch} from "@/router/utils";
import {usePermissionStoreHook} from "@/store/modules/permission";
import {avatar, bg, illustration} from "./utils/static";
import {useRenderIcon} from "@/components/ReIcon/src/hooks";
import {getCurrentInstance, onBeforeUnmount, onMounted, reactive, ref, toRaw, watchEffect} from "vue";
import {useTranslationLang} from "@/layout/hooks/useTranslationLang";
import {useDataThemeChange} from "@/layout/hooks/useDataThemeChange";
import Lock from "@iconify-icons/ri/lock-fill";
import User from "@iconify-icons/ri/user-3-fill";
import {useWallet, WalletMultiButton} from "solana-wallets-vue";

defineOptions({
  name: "Login"
});
const router = useRouter();
const loading = ref(false);
const ruleFormRef = ref<FormInstance>();

const { initStorage } = useLayout();
initStorage();

const { t } = useI18n();
const { dataTheme, dataThemeChange } = useDataThemeChange();
dataThemeChange();
const { title, getDropdownItemStyle, getDropdownItemClass } = useNav();
const { locale, translationCh, translationEn } = useTranslationLang();

const ruleForm = reactive({
  username: "",
  password: ""
});

const { proxy } = getCurrentInstance()
watchEffect(async () => {
  if (proxy.$wallet.connected.value) {
    const { publicKey } = useWallet();
    // The wallet is connected and you can log in
    useUserStoreHook()
      .loginByWallet({ publicKey: publicKey.value?.toBase58() })
      .then(res => {
        if (res.code == 200) {
          // All of them adopt a static routing pattern
          usePermissionStoreHook().handleWholeMenus([]);
          addPathMatch();
          router.push("/");
          message("login success", { type: "success" });
        }
      }).catch(error => {
        proxy.$wallet.disconnect();
        message("This wallet address does not have permission to log in, please contact the administrator.", { type: "error" });
      });
  }
})

const onLogin = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      useUserStoreHook()
        .loginByUsername({ username: ruleForm.username, password: ruleForm.password })
        .then(res => {
          if (res.code == 200) {
            // All of them adopt a static routing pattern
            usePermissionStoreHook().handleWholeMenus([]);
            addPathMatch();
            router.push("/");
            message("login success", { type: "success" });
          } else {
            loading.value = false;
            return fields;
          }
        }).catch(error => {
           loading.value = false;
        });
    } else {
      loading.value = false;
      return fields;
    }
  });
};

/** Use a public function to avoid disabling 'removeEventListener' */
function onkeypress({ code }: KeyboardEvent) {
  if (code === "Enter") {
    onLogin(ruleFormRef.value);
  }
}

onMounted(() => {
  window.document.addEventListener("keypress", onkeypress);
  translationEn()
});

onBeforeUnmount(() => {
  window.document.removeEventListener("keypress", onkeypress);
});
</script>

<template>
  <div class="select-none">
    <img :src="bg" class="wave" />
    <div class="flex-c absolute right-5 top-3">
      <wallet-multi-button></wallet-multi-button>
      <!-- 主题 -->
      <!-- <el-switch
        v-model="dataTheme"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="dataThemeChange"
      /> -->
      <!-- 国际化 -->
      <!-- <el-dropdown trigger="click">
        <globalization
          class="hover:text-primary hover:!bg-[transparent] w-[20px] h-[20px] ml-1.5 cursor-pointer outline-none duration-300"
        />
        <template #dropdown>
          <el-dropdown-menu class="translation">
            <el-dropdown-item
              :style="getDropdownItemStyle(locale, 'zh')"
              :class="['dark:!text-white', getDropdownItemClass(locale, 'zh')]"
              @click="translationCh"
            >
              <IconifyIconOffline
                v-show="locale === 'zh'"
                class="check-zh"
                :icon="Check"
              />
              简体中文
            </el-dropdown-item>
            <el-dropdown-item
              :style="getDropdownItemStyle(locale, 'en')"
              :class="['dark:!text-white', getDropdownItemClass(locale, 'en')]"
              @click="translationEn"
            >
              <span v-show="locale === 'en'" class="check-en">
                <IconifyIconOffline :icon="Check" />
              </span>
              English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
</el-dropdown> -->
    </div>
    <div class="login-container">
      <div class="img">
        <component :is="toRaw(illustration)" />
      </div>
      <div class="login-box">
        <div class="login-form">
          <avatar class="avatar" />
          <Motion>
            <h2 class="outline-none">{{ title }}</h2>
          </Motion>

          <el-form ref="ruleFormRef" :model="ruleForm" :rules="loginRules" size="large">
            <Motion :delay="100">
              <el-form-item :rules="[
      {
        required: true,
        message: transformI18n($t('login.usernameReg')),
        trigger: 'blur'
      }
    ]" prop="username">
                <el-input v-model="ruleForm.username" clearable :placeholder="t('login.username')"
                  :prefix-icon="useRenderIcon(User)" />
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-form-item prop="password">
                <el-input v-model="ruleForm.password" clearable show-password :placeholder="t('login.password')"
                  :prefix-icon="useRenderIcon(Lock)" />
              </el-form-item>
            </Motion>

            <Motion :delay="250">
              <el-button class="w-full mt-4" size="default" type="primary" :loading="loading"
                @click="onLogin(ruleFormRef)">
                {{ t("login.login") }}
              </el-button>
            </Motion>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("@/style/login.css");
</style>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}

.translation {
  ::v-deep(.el-dropdown-menu__item) {
    padding: 5px 40px;
  }

  .check-zh {
    position: absolute;
    left: 20px;
  }

  .check-en {
    position: absolute;
    left: 20px;
  }
}
</style>
