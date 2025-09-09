import { useForm } from '@inertiajs/vue3';
import { toast } from 'vue-sonner';
import type { ModalMode } from './useModal';

export interface CrudFormOptions {
    createRoute: string;
    updateRoute: (id: string | number) => string;
    successMessage?: {
        create?: string;
        update?: string;
    };
    onSuccess?: (mode: ModalMode) => void;
    onError?: (errors: any, mode: ModalMode) => void;
}

export function useCrudForm<T extends Record<string, any>>(
    initialData: T,
    options: CrudFormOptions
) {
    const form = useForm(initialData);

    const submitForm = (mode: ModalMode, id?: string | number) => {
        const isCreate = mode === 'create';
        const route = isCreate ? options.createRoute : options.updateRoute(id!);
        const method = isCreate ? 'post' : 'patch';

        form[method](route, {
            preserveScroll: true,
            onSuccess: () => {
                const message = isCreate 
                    ? (options.successMessage?.create || 'Elemento creado correctamente')
                    : (options.successMessage?.update || 'Elemento actualizado correctamente');
                
                toast(message, {
                    description: isCreate 
                        ? 'El elemento ha sido creado exitosamente'
                        : 'Los cambios han sido guardados exitosamente'
                });

                form.reset();
                options.onSuccess?.(mode);
            },
            onError: (errors) => {
                console.error(`Error ${isCreate ? 'creating' : 'updating'} item:`, errors);
                options.onError?.(errors, mode);
            }
        });
    };

    const resetForm = () => {
        form.reset();
        form.clearErrors();
    };

    const populateForm = (data: Partial<T>) => {
        Object.keys(initialData).forEach(key => {
            if (key in data) {
                (form as any)[key] = data[key as keyof typeof data];
            }
        });
    };

    return {
        form,
        submitForm,
        resetForm,
        populateForm,
    };
}