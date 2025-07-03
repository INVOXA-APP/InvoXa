"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { updateUser } from "@/app/admin/users/actions"
import type { User } from "@/types/user"

interface EditUserFormProps {
  user: User
  onUserUpdated: () => void
  onCancel: () => void
}

export function EditUserForm({ user, onUserUpdated, onCancel }: EditUserFormProps) {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [role, setRole] = useState(user.role)
  const { toast } = useToast()

  useEffect(() => {
    setName(user.name)
    setEmail(user.email)
    setRole(user.role)
  }, [user])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    formData.append("id", user.id) // Ensure user ID is passed
    formData.set("name", name)
    formData.set("email", email)
    formData.set("role", role)

    const result = await updateUser(formData)
    setLoading(false)

    if (result.success) {
      toast({
        title: "Success!",
        description: result.message,
      })
      onUserUpdated()
    } else {
      toast({
        title: "Error!",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-name">Name</Label>
        <Input id="edit-name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="edit-email">Email</Label>
        <Input
          id="edit-email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="edit-role">Role</Label>
        <Select name="role" value={role} onValueChange={setRole} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="employee">Employee</SelectItem>
            <SelectItem value="client">Client</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Updating User..." : "Update User"}
        </Button>
      </div>
    </form>
  )
}
