import { ref } from 'vue';
import { router } from '@inertiajs/vue3';
import { toast } from 'vue-sonner';

export interface ConfirmationOptions {
    deleteRoute: (id: string | number) => string;
    bulkDeleteRoute?: string;
    successMessage?: {
        single?: string;
        bulk?: string;
    };
    errorMessage?: {
        single?: string;
        bulk?: string;
    };
    onSuccess?: (type: 'single' | 'bulk') => void;
    onError?: (errors: any, type: 'single' | 'bulk') => void;
}

export function useConfirmation(options: ConfirmationOptions) {
    // Single delete confirmation
    const isDeleteDialogOpen = ref(false);
    const itemToDeleteId = ref<number | null>(null);

    // Bulk delete confirmation
    const isBulkDeleteDialogOpen = ref(false);
    const selectedIdsToDelete = ref<string[]>([]);

    const showDeleteConfirmation = (id: string | number) => {
        itemToDeleteId.value = typeof id === 'string' ? parseInt(id) : id;
        isDeleteDialogOpen.value = true;
    };

    const showBulkDeleteConfirmation = (ids: string[]) => {
        if (!ids.length) return;
        selectedIdsToDelete.value = ids;
        isBulkDeleteDialogOpen.value = true;
    };

    const confirmDelete = () => {
        if (!itemToDeleteId.value) return;

        router.delete(options.deleteRoute(itemToDeleteId.value), {
            preserveScroll: true,
            onSuccess: () => {
                const message = options.successMessage?.single || 'Elemento eliminado correctamente';
                toast(message, {
                    description: 'El elemento ha sido eliminado del sistema'
                });
                isDeleteDialogOpen.value = false;
                itemToDeleteId.value = null;
                options.onSuccess?.('single');
            },
            onError: (errors) => {
                const message = options.errorMessage?.single || 'Error al eliminar el elemento';
                toast.error(message, {
                    description: 'No se pudo eliminar el elemento. Puede tener entidades asociadas.'
                });
                options.onError?.(errors, 'single');
            }
        });
    };

    const confirmBulkDelete = () => {
        if (!options.bulkDeleteRoute || !selectedIdsToDelete.value.length) return;

        router.post(options.bulkDeleteRoute, {
            ids: selectedIdsToDelete.value
        }, {
            preserveScroll: true,
            onSuccess: () => {
                const message = options.successMessage?.bulk || 'Elementos eliminados correctamente';
                toast(message, {
                    description: 'Los elementos seleccionados han sido eliminados exitosamente'
                });
                isBulkDeleteDialogOpen.value = false;
                selectedIdsToDelete.value = [];
                options.onSuccess?.('bulk');
            },
            onError: (errors) => {
                const message = options.errorMessage?.bulk || 'Error al eliminar elementos';
                toast.error(message, {
                    description: 'Error al eliminar algunos elementos. Pueden tener entidades asociadas.'
                });
                isBulkDeleteDialogOpen.value = false;
                options.onError?.(errors, 'bulk');
            }
        });
    };

    const cancelDelete = () => {
        isDeleteDialogOpen.value = false;
        itemToDeleteId.value = null;
    };

    const cancelBulkDelete = () => {
        isBulkDeleteDialogOpen.value = false;
        selectedIdsToDelete.value = [];
    };

    return {
        // Single delete
        isDeleteDialogOpen,
        itemToDeleteId,
        showDeleteConfirmation,
        confirmDelete,
        cancelDelete,

        // Bulk delete
        isBulkDeleteDialogOpen,
        selectedIdsToDelete,
        showBulkDeleteConfirmation,
        confirmBulkDelete,
        cancelBulkDelete,
    };
}