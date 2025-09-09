<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from 'vue';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/composables/usePermissions';

interface EmptyStateProps {
  icon?: Component;
  title?: string;
  description?: string;
  actionText?: string;
  showAction?: boolean;
  actionPermission?: string;
}

interface EmptyStateEmits {
  action: [];
}

const props = withDefaults(defineProps<EmptyStateProps>(), {
  title: 'No hay datos',
  description: 'No se encontraron elementos para mostrar.',
  actionText: 'Crear nuevo',
  showAction: true,
  actionPermission: undefined,
});

const emit = defineEmits<EmptyStateEmits>();

const { hasPermission } = usePermissions();

const canShowAction = computed(() => {
  if (!props.showAction) return false;
  if (!props.actionPermission) return true;
  return hasPermission(props.actionPermission);
});

const handleAction = () => {
  emit('action');
};
</script>

<template>
  <div class="text-center py-12">
    <!-- Icon slot with fallback -->
    <div class="mx-auto h-12 w-12 text-gray-400 mb-4">
      <slot name="icon">
        <component 
          v-if="icon" 
          :is="icon" 
          class="mx-auto h-12 w-12 text-gray-400" 
        />
        <div 
          v-else 
          class="mx-auto h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center"
        >
          <svg 
            class="h-6 w-6 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
        </div>
      </slot>
    </div>

    <!-- Title -->
    <h3 class="mt-2 text-sm font-medium text-gray-600 dark:text-gray-300">
      <slot name="title">
        {{ title }}
      </slot>
    </h3>

    <!-- Description -->
    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
      <slot name="description">
        {{ description }}
      </slot>
    </p>

    <!-- Action button -->
    <div v-if="canShowAction" class="mt-6">
      <slot name="action" :on-action="handleAction">
        <Button 
          @click="handleAction"
          class="gap-2"
        >
          <slot name="action-icon">
            <svg 
              class="h-4 w-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
              />
            </svg>
          </slot>
          {{ actionText }}
        </Button>
      </slot>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles if needed */
.empty-state-container {
  /* Custom styles can be added here */
}
</style>