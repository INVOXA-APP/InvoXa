import { UserManagementClient } from "@/components/user-management-client"
import { AdminLayout } from "@/components/admin-layout"

export default function UserManagementPage() {
  return (
    <AdminLayout>
      <UserManagementClient />
    </AdminLayout>
  )
}
