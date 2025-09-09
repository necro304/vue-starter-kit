<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { router } from '@inertiajs/vue3';

import type {
    ColumnDef,
    ColumnFiltersState,
    ExpandedState,
    SortingState,
    VisibilityState,
} from '@tanstack/vue-table';

// Extendemos la definición del tipo ColumnDef para permitir propiedades personalizadas
declare module '@tanstack/vue-table' {
    interface ColumnMeta<TData extends unknown, TValue> {
        size?: number;
        cardTitle?: string;
        isPrimary?: boolean; // Para marcar la columna principal en vista de tarjetas
        hideInCard?: boolean; // Para ocultar columnas específicas en la vista de tarjetas
        hideInTable?: boolean; // Para ocultar columnas específicas en la vista de tabla
    }
}

import { valueUpdater } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table/index';
import {
    FlexRender,
    getCoreRowModel,
    getExpandedRowModel,
    useVueTable,
} from '@tanstack/vue-table';

const props = defineProps<{
    // Table data and pagination info
    data: any[];
    columns: ColumnDef<any>[];
    pagination: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    // URL and filters
    routePath: string;
    filters?: {
        search?: string;
        sort?: string;
    };
    // Optional configurations
    searchKey?: string;
    searchPlaceholder?: string;
    enableSelection?: boolean;
}>();

const emit = defineEmits(['rowAction', 'selectionChange']);

// Table state
const sorting = ref<SortingState>([]);
const columnFilters = ref<ColumnFiltersState>([]);
const columnVisibility = ref<VisibilityState>({});
const rowSelection = ref({});
const expanded = ref<ExpandedState>({});
const searchFilter = ref(props.filters?.search || '');

// Initialize sorting state from URL params
onMounted(() => {
    if (props.filters?.sort && typeof props.filters?.sort === 'string') {
        sorting.value = [
            {
                id: props.filters.sort.replace(/^-/, ''),
                desc: props.filters.sort.startsWith('-'),
            },
        ];
    }
});

const pagesCount = computed(() => props.pagination?.last_page || 0);

// Table initialization
const table = useVueTable({
    get data() {
        return props.data || [];
    },
    columns: props.columns,
    pageCount: pagesCount.value,
    manualPagination: true,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowId: row => row.id,
    onSortingChange: updaterOrValue => {
        valueUpdater(updaterOrValue, sorting);
        // Get the first sorting item
        if (sorting.value.length > 0) {
            const { id, desc } = sorting.value[0];
            handleSort(id, desc ? 'desc' : 'asc');
        }
    },
    onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
    onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
    onRowSelectionChange: updaterOrValue => {
        valueUpdater(updaterOrValue, rowSelection);
        emit('selectionChange', rowSelection.value);
        console.log('Selected rows:', rowSelection.value);
    },
    onExpandedChange: updaterOrValue => valueUpdater(updaterOrValue, expanded),
    state: {
        get sorting() { return sorting.value },
        get columnFilters() { return columnFilters.value },
        get columnVisibility() { return columnVisibility.value },
        get rowSelection() { return rowSelection.value },
        get expanded() { return expanded.value },
        get pagination() {
            return {
                pageIndex: (props.pagination?.current_page || 1) - 1,
                pageSize: props.pagination?.per_page || 10,
            }
        },
    },
    enableRowSelection: props.enableSelection !== false,
    enableMultiRowSelection: props.enableSelection !== false,
});

// Expose the table instance to the parent component
defineExpose({ table, rowSelection });

function handleSort(column: string, direction: string) {
    router.get(
        props.routePath,
        {
            sort: direction === 'desc' ? `-${column}` : column,
            [props.searchKey ?? 'filter[search]']: searchFilter.value,
            page: props.pagination?.current_page,
        },
        { preserveState: true, preserveScroll: true }
    );
    // update sorting state
    sorting.value = [{ id: column, desc: direction === 'desc' }];
}

function handleSearchFilterChange() {
    router.get(
        props.routePath,
        {
            'filter[search]': searchFilter.value,
            sort: props.filters?.sort,
            page: 1, // Reset to page 1 when filter changes
        },
        { preserveState: true, preserveScroll: true }
    );
}

function goToPage(page: number) {
    router.get(
        props.routePath,
        {
            page,
            'filter[search]': searchFilter.value,
            sort: props.filters?.sort,
        },
        { preserveState: true, preserveScroll: true }
    );
}

// Computed pagination display values
const paginationInfo = {
    from: computed(() => {
        if (!props.data?.length) return 0;
        return ((props.pagination.current_page - 1) * props.pagination.per_page) + 1;
    }),
    to: computed(() => {
        if (!props.data?.length) return 0;
        return Math.min(props.pagination.current_page * props.pagination.per_page, props.pagination.total);
    }),
};

// Get the count of selected rows
const selectedCount = computed(() => {
    return Object.keys(rowSelection.value).length;
});

// Check if any rows are selected
const hasSelection = computed(() => selectedCount.value > 0);

// Función para obtener el título de la columna para las tarjetas móviles
function getColumnTitle(column: any) {
    // Si hay un título explícito en la meta de la columna, úsalo
    if (column.columnDef.meta?.cardTitle) {
        return column.columnDef.meta.cardTitle;
    }
    
    // Si es una función de encabezado, extraemos el nombre de accessorKey
    if (column.columnDef.accessorKey) {
        // Convertir de camelCase a palabras (ej: createdAt -> Created At)
        return column.columnDef.accessorKey
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str: string) => str.toUpperCase());
    }
    
    // Si hay un ID de columna, úsalo como respaldo
    if (column.id) {
        return column.id
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (str: string) => str.toUpperCase());
    }
    
    // Valor por defecto
    return 'Campo';
}
</script>

<template>
    <div class="w-full space-y-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between py-2 sm:py-4 gap-2 sm:gap-0">
            <div class="flex items-center gap-2 w-full sm:w-auto">
                <Input class="w-full sm:max-w-sm" :placeholder="searchPlaceholder || 'Buscar...'" @input="handleSearchFilterChange"
                    v-model="searchFilter" />
                <slot name="filters"></slot>
            </div>

            <div class="flex gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <!-- Show selection info when rows are selected -->
                <div v-if="hasSelection" class="flex items-center mr-1 sm:mr-3 text-xs sm:text-sm">
                    <div class="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-medium">
                        {{ selectedCount }} seleccionados
                    </div>
                    <slot name="selectionActions" :selected="rowSelection"></slot>
                </div>
                <slot name="actions"></slot>
            </div>
        </div>

        <!-- Vista de tabla para pantallas md y superiores -->
        <div class="rounded-md border overflow-x-auto hidden md:block">
            <Table>
                <TableHeader>
                    <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                        <template v-for="header in headerGroup.headers" :key="header.id">
                            <TableHead 
                                v-if="!header.column.columnDef.meta?.hideInTable"
                                :style="header.column.columnDef.meta?.size ? { width: `${header.column.columnDef.meta.size}px`, minWidth: `${header.column.columnDef.meta.size}px` } : {}"
                            >
                                <FlexRender v-if="!header.isPlaceholder" :render="header.column.columnDef.header"
                                    :props="header.getContext()" />
                            </TableHead>
                        </template>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <template v-if="data?.length">
                        <template v-for="row in table.getRowModel().rows" :key="row.id">
                            <TableRow :data-state="row.getIsSelected() && 'selected'">
                                <template v-for="cell in row.getVisibleCells()" :key="cell.id">
                                    <TableCell 
                                        v-if="!cell.column.columnDef.meta?.hideInTable"
                                        :style="cell.column.columnDef.meta?.size ? { width: `${cell.column.columnDef.meta.size}px`, minWidth: `${cell.column.columnDef.meta.size}px` } : {}"
                                    >
                                        <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                                    </TableCell>
                                </template>
                            </TableRow>
                            <TableRow v-if="row.getIsExpanded()">
                                <TableCell :colspan="row.getAllCells().length">
                                    <slot name="expandedRow" :row="row.original"></slot>
                                </TableCell>
                            </TableRow>
                        </template>
                    </template>

                    <TableRow v-else>
                        <TableCell :colspan="columns.length" class="h-24 text-center">
                            <slot name="empty-state">No se encontraron resultados.</slot>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>

        <!-- Vista de tarjetas para dispositivos móviles (hasta md) -->
        <div class="space-y-4 md:hidden">
            <template v-if="data?.length">
                <div 
                    v-for="row in table.getRowModel().rows" 
                    :key="row.id" 
                    class="bg-card border rounded-lg shadow-sm overflow-hidden transition-all duration-200 cursor-pointer"
                    :class="{
                        'border-primary shadow-md bg-primary/5 ring-1 ring-primary/30 transform-gpu': row.getIsSelected(),
                        'hover:border-primary/30 hover:shadow-md hover:bg-muted/30 active:scale-[0.99]': !row.getIsSelected()
                    }"
                    @click="props.enableSelection !== false ? row.toggleSelected(!row.getIsSelected()) : null"
                >
                    <div class="flex items-center justify-between p-3 md:p-4 bg-muted/30 border-b">
                        <!-- Información principal/título en la parte superior -->
                        <div class="font-medium text-sm flex items-center gap-3">
                            <!-- Checkbox de selección -->
                            <div 
                                v-if="props.enableSelection !== false" 
                                @click.stop 
                                class="relative"
                            >
                                <Checkbox
                                    :modelValue="row.getIsSelected()"
                                    @update:modelValue="value => row.toggleSelected(value === true)"
                                    aria-label="Seleccionar fila"
                                    class="mr-1"
                                />
                            </div>
                            
                            <!-- Primer campo (normalmente el nombre o título principal) -->
                            <template v-for="cell in row.getVisibleCells()" :key="cell.id">
                                <template v-if="cell.column.id !== 'select-row' && 
                                              cell.column.id !== 'actions' && 
                                              cell.column.columnDef.meta?.isPrimary">
                                    <div class="text-base font-semibold">
                                        <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                                    </div>
                                </template>
                            </template>
                        </div>
                        
                        <!-- Botones de acción en la parte superior derecha -->
                        <div class="flex items-center" @click.stop>
                            <template v-for="cell in row.getVisibleCells()" :key="cell.id">
                                <template v-if="cell.column.id === 'actions'">
                                    <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                                </template>
                            </template>
                        </div>
                    </div>

                    <div class="p-3 md:p-4">
                        <!-- Contenido principal de la tarjeta -->
                        <div class="grid grid-cols-1 gap-3">
                            <template v-for="cell in row.getVisibleCells()" :key="cell.id">
                                <template v-if="cell.column.id !== 'select-row' && 
                                              cell.column.id !== 'actions' && 
                                              !cell.column.columnDef.meta?.isPrimary &&
                                              !cell.column.columnDef.meta?.hideInCard">
                                    <div class="flex flex-col">
                                        <!-- Título del campo (header) -->
                                        <div class="text-sm text-muted-foreground mb-1">
                                            <!-- Extraer el título de la columna -->
                                            <span>
                                                {{ getColumnTitle(cell.column) }}
                                            </span>
                                        </div>
                                        <!-- Valor del campo -->
                                        <div class="font-medium">
                                            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
                                        </div>
                                    </div>
                                </template>
                            </template>
                        </div>
                    </div>

                    <div v-if="row.getIsExpanded()" class="p-4 border-t">
                        <slot name="expandedRow" :row="row.original"></slot>
                    </div>
                </div>
            </template>

            <div v-else class="text-center p-8 bg-card border rounded-lg flex flex-col items-center justify-center">
                <div class="text-muted-foreground/30 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="8" height="14" x="8" y="5" rx="1" />
                        <path d="M4 5a1 1 0 0 1 1-1h4v16H5a1 1 0 0 1-1-1V5Z" />
                        <path d="M16 5a1 1 0 0 0-1-1h-4v16h4a1 1 0 0 0 1-1V5Z" />
                    </svg>
                </div>
                <div class="text-base font-medium">
                    <slot name="empty-state">No se encontraron resultados.</slot>
                </div>
                <div class="text-xs text-muted-foreground mt-2">Intenta cambiar los filtros de búsqueda</div>
            </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 py-2 sm:py-4">
            <div class="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
                <template v-if="pagination?.total">
                    Mostrando <span class="font-medium">{{ paginationInfo.from }}</span> a
                    <span class="font-medium">{{ paginationInfo.to }}</span> de
                    <span class="font-medium">{{ pagination.total }}</span> entradas
                </template>
                <template v-else>
                    No se encontraron entradas
                </template>
            </div>
            <div class="flex space-x-2 order-1 sm:order-2">
                <Button variant="outline" size="sm" :disabled="!pagination?.current_page || pagination.current_page <= 1"
                    @click="goToPage(pagination!.current_page - 1)" class="h-8 w-8 sm:w-auto sm:px-4">
                    <span class="hidden sm:inline">Anterior</span>
                    <span class="sm:hidden">&larr;</span>
                </Button>
                <Button variant="outline" size="sm"
                    :disabled="!pagination?.current_page || pagination.current_page >= pagination.last_page"
                    @click="goToPage(pagination!.current_page + 1)" class="h-8 w-8 sm:w-auto sm:px-4">
                    <span class="hidden sm:inline">Siguiente</span>
                    <span class="sm:hidden">&rarr;</span>
                </Button>
            </div>
        </div>
    </div>
</template>
