import { ref } from 'vue';

export type ModalMode = 'create' | 'edit';

export function useModal<T = any>() {
    const isOpen = ref(false);
    const mode = ref<ModalMode>('create');
    const editingItem = ref<T | null>(null);

    const openModal = (item: T | null | undefined = null, modalMode: ModalMode = 'create') => {
        editingItem.value = item || null;
        mode.value = modalMode;
        isOpen.value = true;
    };

    const closeModal = () => {
        isOpen.value = false;
        mode.value = 'create';
        editingItem.value = null;
    };

    const openCreateModal = () => {
        openModal(null, 'create');
    };

    const openEditModal = (item: T | null | undefined) => {
        openModal(item, 'edit');
    };

    return {
        isOpen,
        mode,
        editingItem,
        openModal,
        closeModal,
        openCreateModal,
        openEditModal,
    };
}