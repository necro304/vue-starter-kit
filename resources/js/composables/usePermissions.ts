import { usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import type { User, AppPageProps } from '@/types';

export function usePermissions() {
    const page = usePage<AppPageProps>();
    
    const user = computed(() => page.props.auth.user as User | null);
    
    const roles = computed(() => user.value?.roles || []);
    const permissions = computed(() => user.value?.permissions || []);
    
    const hasPermission = (permission: string): boolean => {
        return permissions.value.includes(permission);
    };
    
    const hasAnyPermission = (permissionList: string[]): boolean => {
        return permissionList.some(permission => permissions.value.includes(permission));
    };
    
    const hasAllPermissions = (permissionList: string[]): boolean => {
        return permissionList.every(permission => permissions.value.includes(permission));
    };
    
    const hasRole = (role: string): boolean => {
        return roles.value.includes(role);
    };
    
    const hasAnyRole = (roleList: string[]): boolean => {
        return roleList.some(role => roles.value.includes(role));
    };
    
    const hasAllRoles = (roleList: string[]): boolean => {
        return roleList.every(role => roles.value.includes(role));
    };
    
    const isAdmin = computed(() => hasRole('admin') || hasRole('super-admin'));
    const isSuperAdmin = computed(() => hasRole('super-admin'));
    
    // Specific permission checks
    const can = {
        // Users
        viewUsers: computed(() => hasPermission('users.view')),
        createUsers: computed(() => hasPermission('users.create')),
        editUsers: computed(() => hasPermission('users.edit')),
        deleteUsers: computed(() => hasPermission('users.delete')),
        
        // Roles
        viewRoles: computed(() => hasPermission('roles.view')),
        createRoles: computed(() => hasPermission('roles.create')),
        editRoles: computed(() => hasPermission('roles.edit')),
        deleteRoles: computed(() => hasPermission('roles.delete')),
        
        // Permissions
        viewPermissions: computed(() => hasPermission('permissions.view')),
        createPermissions: computed(() => hasPermission('permissions.create')),
        editPermissions: computed(() => hasPermission('permissions.edit')),
        deletePermissions: computed(() => hasPermission('permissions.delete')),
        
        
        // Dashboard
        viewDashboard: computed(() => hasPermission('dashboard.view')),
        viewAnalytics: computed(() => hasPermission('dashboard.analytics')),
        
        // Settings
        viewSettings: computed(() => hasPermission('settings.view')),
        editSettings: computed(() => hasPermission('settings.edit')),
        
        // System
        viewTelescope: computed(() => hasPermission('system.telescope')),
        viewLogs: computed(() => hasPermission('system.logs')),
    };
    
    return {
        user,
        roles,
        permissions,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        hasRole,
        hasAnyRole,
        hasAllRoles,
        isAdmin,
        isSuperAdmin,
        can,
    };
}
