<script setup lang="ts">
import MenuFold from "@iconify-icons/ri/menu-fold-fill";
import MenuUnfold from "@iconify-icons/ri/menu-unfold-fill";

interface Props {
  isActive: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false
});

const emit = defineEmits<{
  (e: "toggleClick"): void;
}>();

const toggleClick = () => {
  emit("toggleClick");
};
</script>

<template>
  <div class="px-3 mr-1 navbar-bg-hover" :title="props.isActive ? 'Fold' : 'Expand'" @click="toggleClick">
    <IconifyIconOffline :icon="props.isActive ? MenuFold : MenuUnfold"
      class="inline-block align-middle hover:text-primary dark:hover:!text-white" />
  </div>
</template>
