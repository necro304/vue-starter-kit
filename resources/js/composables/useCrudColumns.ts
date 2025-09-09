import type { ColumnDef } from '@tanstack/vue-table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Pencil, Trash2 } from 'lucide-vue-next';
import { h } from 'vue';
import { usePermissions } from '@/composables/usePermissions';

export interface ColumnConfig {
    key: string;
    header: string;
    sortable?: boolean;
    type?: 'text' | 'email' | 'date' | 'badges' | 'custom';
    formatter?: (value: any) => string;
    render?: (value: any, row: any) => any;
    class?: string;
}

export interface AdditionalAction {
    icon: any;
    title: string;
    permission?: string;
    onClick: (item: any) => void;
    variant?: 'ghost' | 'outline' | 'default' | 'destructive' | 'secondary';
    class?: string;
}

export interface ActionsConfig {
    editPermission?: string;
    deletePermission?: string;
    onEdit?: (item: any) => void;
    onDelete?: (id: string) => void;
    additionalActions?: AdditionalAction[];
}

export function useCrudColumns<T = any>() {
    const permissions = usePermissions();

    const createSelectionColumn = (): ColumnDef<T> => ({
        id: 'select-row',
        header: ({ table }) => h(Checkbox, {
            'modelValue': table.getIsAllPageRowsSelected(),
            'onUpdate:modelValue': (value: boolean | "indeterminate") => {
                table.toggleAllPageRowsSelected(value === true);
            },
            'ariaLabel': 'Select all',
        }),
        cell: ({ row }) => h(Checkbox, {
            'modelValue': row.getIsSelected(),
            'onUpdate:modelValue': (value: boolean | "indeterminate") => row.toggleSelected(value === true),
            'ariaLabel': 'Select row',
        }),
        enableSorting: false,
        enableHiding: false,
    });

    const createDataColumn = (config: ColumnConfig): ColumnDef<T> => {
        const column: ColumnDef<T> = {
            accessorKey: config.key,
            header: config.sortable ? ({ column }) => {
                return h(Button, {
                    variant: 'ghost',
                    onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
                }, () => [config.header, h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })])
            } : config.header,
        };

        // Configure cell renderer based on type
        switch (config.type) {
            case 'text':
                column.cell = ({ row }) => h('div', { 
                    class: config.class || 'capitalize' 
                }, config.formatter ? config.formatter(row.getValue(config.key)) : row.getValue(config.key));
                break;
            
            case 'email':
                column.cell = ({ row }) => h('div', { 
                    class: config.class || 'lowercase' 
                }, row.getValue(config.key));
                break;
            
            case 'date':
                column.cell = ({ row }) => h('div', { 
                    class: config.class 
                }, new Date(row.getValue(config.key)).toLocaleDateString());
                break;
            
            case 'badges':
                column.cell = ({ row }) => {
                    const items = row.getValue(config.key) as Array<{id: number, name: string}> || [];
                    return h('div', { class: 'flex gap-1 flex-wrap' },
                        items.map(item =>
                            h(Badge, {
                                class: config.class || '',
                                key: item.id
                            }, () => item.name)
                        )
                    )
                };
                break;
            
            case 'custom':
                if (config.render) {
                    column.cell = ({ row }) => config.render!(row.getValue(config.key), row.original);
                }
                break;
            
            default:
                column.cell = ({ row }) => h('div', { 
                    class: config.class 
                }, config.formatter ? config.formatter(row.getValue(config.key)) : row.getValue(config.key));
        }

        return column;
    };

    const createActionsColumn = (config: ActionsConfig): ColumnDef<T> => ({
        id: 'actions',
        cell: ({ row }) => {
            const item = row.original as any;
            const actions = [];

            // Add additional actions first
            if (config.additionalActions) {
                config.additionalActions.forEach(action => {
                    if (!action.permission || permissions.hasPermission(action.permission)) {
                        actions.push(
                            h(Button, {
                                variant: action.variant || 'ghost',
                                size: 'icon',
                                onClick: () => action.onClick(item),
                                title: action.title,
                                class: action.class
                            }, () => h(action.icon, { class: 'h-4 w-4' }))
                        );
                    }
                });
            }

            if (config.editPermission && permissions.hasPermission(config.editPermission) && config.onEdit) {
                actions.push(
                    h(Button, {
                        variant: 'ghost',
                        size: 'icon',
                        onClick: () => config.onEdit!(item),
                        title: 'Edit'
                    }, () => h(Pencil, { class: 'h-4 w-4' }))
                );
            }

            if (config.deletePermission && permissions.hasPermission(config.deletePermission) && config.onDelete) {
                actions.push(
                    h(Button, {
                        variant: 'ghost',
                        size: 'icon',
                        onClick: () => config.onDelete!(item.id.toString()),
                        title: 'Delete'
                    }, () => h(Trash2, { class: 'h-4 w-4 text-red-500' }))
                );
            }

            return h('div', { class: 'flex space-x-2' }, actions);
        },
    });

    const buildColumns = (
        dataColumns: ColumnConfig[],
        actionsConfig?: ActionsConfig,
        includeSelection = true
    ): ColumnDef<T>[] => {
        const columns: ColumnDef<T>[] = [];

        // Add selection column if requested
        if (includeSelection) {
            columns.push(createSelectionColumn());
        }

        // Add data columns
        dataColumns.forEach(config => {
            columns.push(createDataColumn(config));
        });

        // Add actions column if configured
        if (actionsConfig) {
            columns.push(createActionsColumn(actionsConfig));
        }

        return columns;
    };

    return {
        createSelectionColumn,
        createDataColumn,
        createActionsColumn,
        buildColumns,
    };
}