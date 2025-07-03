"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { updatePassword } from "@/app/auth/actions"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function UpdatePasswordPage() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleUpdatePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    const formData = new FormData(event.currentTarget)
    const result = await updatePassword(formData)
    setLoading(false)

    if (result.success) {
      toast({
        title: "Success!",
        description: result.message,
      })
      router.push("/dashboard") // Redirect to dashboard after successful password update
    } else {
      toast({
        title: "Error!",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <Image src="/invoxa-logo-v3.png" alt="Invoxa Logo" width={150} height={50} className="mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">Update Password</CardTitle>
          <CardDescription>Set your new password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input id="confirm-password" name="confirm-password" type="password" required />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "Updating password..." : "Update Password"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link className="underline" href="/login">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
