import { ref, computed } from 'vue';

export function useSelection() {
    const selectedItems = ref<Record<string, any>>({});

    const selectedIds = computed(() => Object.keys(selectedItems.value));
    const hasSelection = computed(() => selectedIds.value.length > 0);
    const selectionCount = computed(() => selectedIds.value.length);

    const handleSelectionChange = (selection: Record<string, any>) => {
        selectedItems.value = selection;
    };

    const clearSelection = () => {
        selectedItems.value = {};
    };

    const getSelectedIds = () => {
        return selectedIds.value;
    };

    const isSelected = (id: string | number) => {
        return id.toString() in selectedItems.value;
    };

    return {
        selectedItems,
        selectedIds,
        hasSelection,
        selectionCount,
        handleSelectionChange,
        clearSelection,
        getSelectedIds,
        isSelected,
    };
}