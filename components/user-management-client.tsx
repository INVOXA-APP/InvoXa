"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AddUserForm } from "./add-user-form"
import { EditUserForm } from "./edit-user-form"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"
import { UsersTable } from "./users" // Corrected import
import { getUsers } from "@/app/admin/users/actions"
import type { User } from "@/types/user"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function UserManagementClient() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchUsers = async () => {
    setLoading(true)
    const { users: fetchedUsers, error } = await getUsers()
    if (fetchedUsers) {
      setUsers(fetchedUsers)
    } else {
      console.error("Failed to fetch users:", error)
      setUsers([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleDelete = (userId: string) => {
    setSelectedUser(users.find((u) => u.id === userId) || null)
    setIsDeleteDialogOpen(true)
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add New User</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <AddUserForm
                onUserAdded={() => {
                  fetchUsers()
                  setIsAddUserDialogOpen(false)
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <UsersTable users={filteredUsers} onEdit={handleEdit} onDelete={handleDelete} />

      {selectedUser && (
        <>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
              </DialogHeader>
              <EditUserForm
                user={selectedUser}
                onUserUpdated={() => {
                  fetchUsers()
                  setIsEditDialogOpen(false)
                }}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <DeleteConfirmationDialog
            userId={selectedUser.id}
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={() => {
              fetchUsers()
              setIsDeleteDialogOpen(false)
            }}
          />
        </>
      )}
    </div>
  )
}
