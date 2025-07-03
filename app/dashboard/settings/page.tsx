"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Check, Languages, DollarSign, Palette, Bell, User, Shield, CreditCard, Plug } from "lucide-react"
import {
  useLanguageCurrency,
  languageData,
  currencyData,
  type Language,
  type Currency,
} from "@/contexts/language-currency-context"
import { useTheme } from "next-themes"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { language, currency, setLanguage, setCurrency, t } = useLanguageCurrency()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
  })

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    })
  }

  const settingsSections = [
    {
      id: "language",
      title: t("settings.language"),
      description: t("settings.language_description"),
      icon: Languages,
    },
    {
      id: "currency",
      title: t("settings.currency"),
      description: t("settings.currency_description"),
      icon: DollarSign,
    },
    {
      id: "theme",
      title: t("settings.theme"),
      description: t("settings.theme_description"),
      icon: Palette,
    },
    {
      id: "notifications",
      title: t("settings.notifications"),
      description: t("settings.notifications_description"),
      icon: Bell,
    },
    {
      id: "account",
      title: t("settings.account"),
      description: t("settings.account_description"),
      icon: User,
    },
    {
      id: "security",
      title: t("settings.security"),
      description: t("settings.security_description"),
      icon: Shield,
    },
    {
      id: "billing",
      title: t("settings.billing"),
      description: t("settings.billing_description"),
      icon: CreditCard,
    },
    {
      id: "integrations",
      title: t("settings.integrations"),
      description: t("settings.integrations_description"),
      icon: Plug,
    },
  ]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{t("settings.title")}</h2>
      </div>

      <div className="grid gap-6">
        {/* Language Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              <CardTitle>{t("settings.language")}</CardTitle>
            </div>
            <CardDescription>{t("settings.language_description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="language">Language</Label>
                <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(languageData).map(([code, data]) => (
                      <SelectItem key={code} value={code}>
                        <div className="flex items-center gap-2">
                          <span>{data.flag}</span>
                          <span>{data.name}</span>
                          {language === code && <Check className="h-4 w-4 ml-auto" />}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <CardTitle>{t("settings.currency")}</CardTitle>
            </div>
            <CardDescription>{t("settings.currency_description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={(value: Currency) => setCurrency(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(currencyData).map(([code, data]) => (
                      <SelectItem key={code} value={code}>
                        <div className="flex items-center gap-2">
                          <span>{data.flag}</span>
                          <span>
                            {data.name} ({data.symbol})
                          </span>
                          {currency === code && <Check className="h-4 w-4 ml-auto" />}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <CardTitle>{t("settings.theme")}</CardTitle>
            </div>
            <CardDescription>{t("settings.theme_description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-white border-2 border-gray-300"></div>
                        <span>Light</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gray-900 border-2 border-gray-600"></div>
                        <span>Dark</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-white to-gray-900 border-2 border-gray-400"></div>
                        <span>System</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>{t("settings.notifications")}</CardTitle>
            </div>
            <CardDescription>{t("settings.notifications_description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms-notifications">SMS Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={notifications.sms}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>{t("settings.account")}</CardTitle>
            </div>
            <CardDescription>{t("settings.account_description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Profile Information</p>
                  <p className="text-sm text-muted-foreground">Update your account details and preferences</p>
                </div>
                <Button variant="outline">Edit Profile</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Address</p>
                  <p className="text-sm text-muted-foreground">admin@invoxa.com</p>
                </div>
                <Badge variant="secondary">Verified</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>{t("settings.security")}</CardTitle>
            </div>
            <CardDescription>{t("settings.security_description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                </div>
                <Button variant="outline">Change Password</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} className="w-full sm:w-auto">
            {t("common.save")} Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
