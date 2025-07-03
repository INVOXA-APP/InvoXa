"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Mail } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { resetPasswordForEmail } from "@/app/auth/actions"

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    const formData = new FormData(event.currentTarget)

    try {
      const result = await resetPasswordForEmail(formData)

      if (result.error) {
        setError(result.error)
      } else {
        setMessage(result.message || "Password reset email sent!")
        setEmailSent(true)
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <CardHeader className="space-y-6 text-center pb-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Image src="/invoxa-logo.png" alt="Invoxa" width={40} height={40} className="rounded-lg" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {emailSent ? "Check your email" : "Forgot password?"}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 mt-2">
              {emailSent
                ? "We've sent a password reset link to your email address."
                : "Enter your email address and we'll send you a link to reset your password."}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">
                  Email
                </Label>
                <Input id="email" name="email" type="email" placeholder="m@example.com" required className="h-11" />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send reset link
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              {message && (
                <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  {message}
                </div>
              )}
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </div>
          )}

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:underline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
