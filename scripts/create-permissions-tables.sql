-- Crear tabla de permisos
CREATE TABLE IF NOT EXISTS public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    permission_id text NOT NULL UNIQUE,
    name text NOT NULL,
    description text,
    category text NOT NULL,
    resource text NOT NULL,
    action text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT permissions_pkey PRIMARY KEY (id)
);

-- Crear tabla de roles
CREATE TABLE IF NOT EXISTS public.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role_id text NOT NULL UNIQUE,
    name text NOT NULL,
    description text,
    level integer NOT NULL DEFAULT 10,
    permissions text[] DEFAULT '{}',
    is_system boolean DEFAULT false,
    color text DEFAULT 'bg-gray-100 text-gray-800',
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT roles_pkey PRIMARY KEY (id)
);

-- Crear tabla de asignación de roles a usuarios
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role_id text NOT NULL,
    assigned_at timestamp with time zone DEFAULT now() NOT NULL,
    assigned_by uuid,
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true,
    CONSTRAINT user_roles_pkey PRIMARY KEY (id),
    CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(role_id) ON DELETE CASCADE,
    CONSTRAINT user_roles_unique UNIQUE (user_id, role_id)
);

-- Habilitar RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Políticas para permisos
CREATE POLICY "Admins can manage permissions" ON public.permissions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = auth.uid() AND r.level >= 80 AND ur.is_active = true
  )
);

-- Políticas para roles
CREATE POLICY "Admins can manage roles" ON public.roles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = auth.uid() AND r.level >= 80 AND ur.is_active = true
  )
);

-- Políticas para asignación de roles
CREATE POLICY "Admins can manage user roles" ON public.user_roles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = auth.uid() AND r.level >= 80 AND ur.is_active = true
  )
);

-- Política para que los usuarios vean sus propios roles
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (
  user_id = auth.uid()
);

-- Insertar permisos por defecto
INSERT INTO public.permissions (permission_id, name, description, category, resource, action) VALUES
-- Gestión de Usuarios
('users_view', 'Ver Usuarios', 'Ver lista de usuarios', 'Usuarios', 'users', 'view'),
('users_create', 'Crear Usuarios', 'Crear nuevos usuarios', 'Usuarios', 'users', 'create'),
('users_edit', 'Editar Usuarios', 'Modificar usuarios existentes', 'Usuarios', 'users', 'edit'),
('users_delete', 'Eliminar Usuarios', 'Eliminar usuarios del sistema', 'Usuarios', 'users', 'delete'),
('users_manage', 'Gestionar Usuarios', 'Gestión completa de usuarios', 'Usuarios', 'users', 'manage'),

-- Gestión de Facturas
('invoices_view', 'Ver Facturas', 'Ver facturas del sistema', 'Facturas', 'invoices', 'view'),
('invoices_create', 'Crear Facturas', 'Crear nuevas facturas', 'Facturas', 'invoices', 'create'),
('invoices_edit', 'Editar Facturas', 'Modificar facturas existentes', 'Facturas', 'invoices', 'edit'),
('invoices_delete', 'Eliminar Facturas', 'Eliminar facturas', 'Facturas', 'invoices', 'delete'),
('invoices_manage', 'Gestionar Facturas', 'Gestión completa de facturas', 'Facturas', 'invoices', 'manage'),

-- Gestión de Clientes
('clients_view', 'Ver Clientes', 'Ver lista de clientes', 'Clientes', 'clients', 'view'),
('clients_create', 'Crear Clientes', 'Agregar nuevos clientes', 'Clientes', 'clients', 'create'),
('clients_edit', 'Editar Clientes', 'Modificar información de clientes', 'Clientes', 'clients', 'edit'),
('clients_delete', 'Eliminar Clientes', 'Eliminar clientes', 'Clientes', 'clients', 'delete'),
('clients_manage', 'Gestionar Clientes', 'Gestión completa de clientes', 'Clientes', 'clients', 'manage'),

-- Panel Administrativo
('admin_view', 'Ver Panel Admin', 'Acceso al panel administrativo', 'Administración', 'admin', 'view'),
('admin_manage', 'Gestionar Admin', 'Gestión completa del panel admin', 'Administración', 'admin', 'manage'),

-- Sistema
('system_config', 'Configurar Sistema', 'Modificar configuraciones del sistema', 'Sistema', 'system', 'manage'),
('system_backup', 'Backup Sistema', 'Realizar copias de seguridad', 'Sistema', 'system', 'manage'),

-- Reportes
('reports_view', 'Ver Reportes', 'Acceso a reportes y analíticas', 'Reportes', 'reports', 'view'),
('reports_export', 'Exportar Reportes', 'Exportar datos y reportes', 'Reportes', 'reports', 'manage'),

-- Organización
('org_view', 'Ver Organización', 'Ver información organizacional', 'Organización', 'organization', 'view'),
('org_manage', 'Gestionar Organización', 'Gestión organizacional completa', 'Organización', 'organization', 'manage'),

-- CMS y Contenido
('cms_view', 'Ver CMS', 'Acceso al sistema de gestión de contenido', 'CMS', 'cms', 'view'),
('cms_edit', 'Editar Contenido', 'Editar contenido del sitio', 'CMS', 'content', 'edit'),
('cms_manage', 'Gestionar CMS', 'Gestión completa del CMS', 'CMS', 'cms', 'manage'),
('files_manage', 'Gestionar Archivos', 'Subir, editar y eliminar archivos', 'Archivos', 'files', 'manage'),

-- Base de Datos
('database_view', 'Ver Base de Datos', 'Ver estructura de la base de datos', 'Base de Datos', 'database', 'view'),
('database_manage', 'Gestionar Base de Datos', 'Gestión completa de la base de datos', 'Base de Datos', 'database', 'manage'),

-- APIs
('api_view', 'Ver APIs', 'Ver documentación y endpoints de API', 'APIs', 'api', 'view'),
('api_manage', 'Gestionar APIs', 'Gestión completa de APIs', 'APIs', 'api', 'manage')

ON CONFLICT (permission_id) DO NOTHING;

-- Insertar roles por defecto
INSERT INTO public.roles (role_id, name, description, level, permissions, is_system, color) VALUES
('developer', 'Desarrollador', 'Acceso total al sistema para desarrollo', 999, 
 ARRAY['users_view','users_create','users_edit','users_delete','users_manage','invoices_view','invoices_create','invoices_edit','invoices_delete','invoices_manage','clients_view','clients_create','clients_edit','clients_delete','clients_manage','admin_view','admin_manage','system_config','system_backup','reports_view','reports_export','org_view','org_manage','cms_view','cms_edit','cms_manage','files_manage','database_view','database_manage','api_view','api_manage'], 
 true, 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'),

('super_admin', 'Super Administrador', 'Acceso completo al sistema', 100, 
 ARRAY['users_manage','invoices_manage','clients_manage','admin_manage','system_config','system_backup','reports_export','org_manage','cms_manage','files_manage','database_manage','api_manage'], 
 true, 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'),

('admin', 'Administrador', 'Gestión administrativa completa', 80, 
 ARRAY['users_view','users_create','users_edit','invoices_manage','clients_manage','admin_view','reports_view','org_view','cms_edit'], 
 true, 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'),

('manager', 'Manager', 'Gestión de operaciones de negocio', 60, 
 ARRAY['users_view','invoices_manage','clients_manage','reports_view','org_view'], 
 true, 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'),

('employee', 'Empleado', 'Acceso a operaciones diarias', 40, 
 ARRAY['invoices_view','invoices_create','invoices_edit','clients_view','clients_create','clients_edit'], 
 true, 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'),

('client', 'Cliente', 'Acceso limitado a sus propios datos', 20, 
 ARRAY['invoices_view','clients_view'], 
 true, 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'),

('viewer', 'Viewer', 'Solo lectura de información básica', 10, 
 ARRAY['invoices_view','clients_view','reports_view'], 
 true, 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300')

ON CONFLICT (role_id) DO NOTHING;

-- Función para obtener permisos de un usuario
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid uuid)
RETURNS text[] AS $$
DECLARE
    user_permissions text[];
BEGIN
    SELECT ARRAY_AGG(DISTINCT unnest(r.permissions))
    INTO user_permissions
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = user_uuid AND ur.is_active = true;
    
    RETURN COALESCE(user_permissions, '{}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario tiene un permiso
CREATE OR REPLACE FUNCTION user_has_permission(user_uuid uuid, permission_name text)
RETURNS boolean AS $$
DECLARE
    has_permission boolean := false;
BEGIN
    SELECT EXISTS(
        SELECT 1 
        FROM public.user_roles ur
        JOIN public.roles r ON ur.role_id = r.role_id
        WHERE ur.user_id = user_uuid 
        AND ur.is_active = true
        AND (permission_name = ANY(r.permissions) OR r.level >= 999)
    ) INTO has_permission;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el nivel máximo de un usuario
CREATE OR REPLACE FUNCTION get_user_max_level(user_uuid uuid)
RETURNS integer AS $$
DECLARE
    max_level integer := 0;
BEGIN
    SELECT COALESCE(MAX(r.level), 0)
    INTO max_level
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.role_id
    WHERE ur.user_id = user_uuid AND ur.is_active = true;
    
    RETURN max_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS set_permissions_updated_at ON public.permissions;
CREATE TRIGGER set_permissions_updated_at
BEFORE UPDATE ON public.permissions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_roles_updated_at ON public.roles;
CREATE TRIGGER set_roles_updated_at
BEFORE UPDATE ON public.roles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON public.user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_roles_level ON public.roles(level);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON public.permissions(category);
