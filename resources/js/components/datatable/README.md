# EmptyState Component

Componente reutilizable para mostrar estados vacíos en la aplicación SIAP.

## Características

- ✅ **TypeScript**: Completamente tipado con interfaces claras
- ✅ **Props configurables**: Personalizable mediante props
- ✅ **Slots flexibles**: Permite personalización avanzada del contenido
- ✅ **Gestión de permisos**: Integración automática con el sistema de permisos
- ✅ **Iconos personalizables**: Soporte para iconos de Lucide Vue Next
- ✅ **Estilos consistentes**: Sigue el design system de la aplicación

## Uso Básico

```vue
<template>
  <EmptyState
    :icon="Home"
    title="No hay habitaciones"
    description="Comienza creando una nueva habitación."
    action-text="Nueva Habitación"
    action-permission="rooms.create"
    @action="handleCreate"
  />
</template>

<script setup lang="ts">
import EmptyState from '@/shared/components/EmptyState.vue';
import { Home } from 'lucide-vue-next';

const handleCreate = () => {
  // Lógica para crear nuevo elemento
};
</script>
```

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `icon` | `Component` | `undefined` | Componente de icono (Lucide Vue Next) |
| `title` | `string` | `'No hay datos'` | Título principal del estado vacío |
| `description` | `string` | `'No se encontraron elementos para mostrar.'` | Descripción del estado vacío |
| `actionText` | `string` | `'Crear nuevo'` | Texto del botón de acción |
| `showAction` | `boolean` | `true` | Mostrar/ocultar el botón de acción |
| `actionPermission` | `string` | `undefined` | Permiso requerido para mostrar la acción |

## Eventos

| Evento | Descripción |
|--------|-------------|
| `@action` | Se emite cuando se hace clic en el botón de acción |

## Slots

### `#icon`
Personaliza el icono mostrado:

```vue
<EmptyState>
  <template #icon>
    <CustomIcon class="mx-auto h-12 w-12 text-gray-400" />
  </template>
</EmptyState>
```

### `#title`
Personaliza el título:

```vue
<EmptyState>
  <template #title>
    <span class="text-lg font-bold">Título personalizado</span>
  </template>
</EmptyState>
```

### `#description`
Personaliza la descripción:

```vue
<EmptyState>
  <template #description>
    <div>
      <p>Descripción personalizada</p>
      <p class="text-xs">Con múltiples líneas</p>
    </div>
  </template>
</EmptyState>
```

### `#action`
Personaliza completamente el botón de acción:

```vue
<EmptyState>
  <template #action="{ onAction }">
    <div class="space-x-2">
      <Button @click="onAction" variant="default">
        Acción Principal
      </Button>
      <Button @click="handleSecondary" variant="outline">
        Acción Secundaria
      </Button>
    </div>
  </template>
</EmptyState>
```

### `#action-icon`
Personaliza solo el icono del botón de acción:

```vue
<EmptyState>
  <template #action-icon>
    <PlusCircle class="h-4 w-4" />
  </template>
</EmptyState>
```

## Ejemplos de Uso

### Estado vacío simple
```vue
<EmptyState
  title="No hay usuarios"
  description="No se han registrado usuarios aún."
/>
```

### Con acción y permisos
```vue
<EmptyState
  :icon="Users"
  title="No hay usuarios"
  description="Comienza agregando el primer usuario."
  action-text="Agregar Usuario"
  action-permission="users.create"
  @action="openCreateModal"
>
  <template #action-icon>
    <UserPlus class="h-4 w-4" />
  </template>
</EmptyState>
```

### Sin botón de acción
```vue
<EmptyState
  :icon="Search"
  title="Sin resultados"
  description="No se encontraron elementos que coincidan con tu búsqueda."
  :show-action="false"
/>
```

### Completamente personalizado
```vue
<EmptyState @action="handleCreate">
  <template #icon>
    <div class="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
      <Database class="h-8 w-8 text-blue-600" />
    </div>
  </template>
  
  <template #title>
    <h2 class="text-xl font-semibold text-gray-900">
      Base de datos vacía
    </h2>
  </template>
  
  <template #description>
    <div class="space-y-2">
      <p class="text-gray-600">Tu base de datos está lista para usar.</p>
      <p class="text-sm text-gray-500">Importa datos o crea registros manualmente.</p>
    </div>
  </template>
  
  <template #action>
    <div class="space-x-3">
      <Button @click="importData" variant="outline">
        <Upload class="mr-2 h-4 w-4" />
        Importar Datos
      </Button>
      <Button @click="createRecord">
        <Plus class="mr-2 h-4 w-4" />
        Crear Registro
      </Button>
    </div>
  </template>
</EmptyState>
```

## Integración con DataTable

El componente está diseñado para integrarse perfectamente con el componente DataTable:

```vue
<DataTable
  :data="items"
  :columns="columns"
  :pagination="pagination"
>
  <template #empty-state>
    <EmptyState
      :icon="Package"
      title="No hay productos"
      description="Agrega tu primer producto al inventario."
      action-text="Agregar Producto"
      action-permission="products.create"
      @action="handleCreateProduct"
    >
      <template #action-icon>
        <PlusCircle class="h-4 w-4" />
      </template>
    </EmptyState>
  </template>
</DataTable>
```

## Mejores Prácticas

1. **Usa iconos descriptivos**: Elige iconos que representen claramente el tipo de contenido vacío
2. **Mensajes claros**: Escribe títulos y descripciones que expliquen el estado y guíen al usuario
3. **Acciones relevantes**: Solo muestra botones de acción cuando el usuario pueda realmente hacer algo
4. **Respeta los permisos**: Siempre usa `action-permission` para controlar el acceso a las acciones
5. **Consistencia visual**: Mantén el estilo consistente con el resto de la aplicación

## Estructura de Archivos

```
resources/js/shared/components/
├── EmptyState.vue          # Componente principal
├── DataTable.vue           # Componente de tabla (integración)
└── README.md              # Esta documentación
```

## Dependencias

- Vue 3 con Composition API
- TypeScript
- `@/components/ui/button` (Shadcn/ui)
- `@/composables/usePermissions` (Sistema de permisos)
- Lucide Vue Next (iconos)