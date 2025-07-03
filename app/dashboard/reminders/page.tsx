"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle } from "lucide-react"
import { useLanguageCurrency } from "@/contexts/language-currency-context"

export default function RemindersPage() {
  const { t } = useLanguageCurrency()

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("reminders")}</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> {t("add-new-reminder")}
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{t("upcoming-deadlines")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Checkbox id="reminder1" />
              <Label htmlFor="reminder1" className="flex-1">
                {t("submit-q3-report")} (Due: 2024-09-30)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="reminder2" />
              <Label htmlFor="reminder2" className="flex-1">
                {t("follow-up-acme")} (Due: 2024-08-15)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="reminder3" />
              <Label htmlFor="reminder3" className="flex-1">
                {t("renew-software")} (Due: 2024-10-01)
              </Label>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("set-new-reminder")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="reminderTitle">{t("title")}</Label>
              <Input id="reminderTitle" placeholder={t("call-john-doe")} />
            </div>
            <div>
              <Label htmlFor="reminderDate">{t("date")}</Label>
              <Input id="reminderDate" type="date" />
            </div>
            <div>
              <Label htmlFor="reminderTime">{t("time")}</Label>
              <Input id="reminderTime" type="time" />
            </div>
            <Button className="w-full">{t("save-reminder")}</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("completed-reminders")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-500 dark:text-gray-400">
            <p>{t("no-completed-reminders")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
