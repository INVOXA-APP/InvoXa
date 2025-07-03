"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2, Receipt, Upload } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { createExpense } from "@/app/dashboard/expenses/actions"

interface ExpenseFormProps {
  onSuccess?: () => void
}

export function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState<Date>(new Date())
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData(event.currentTarget)
      formData.set("date", date.toISOString())

      const result = await createExpense(formData)

      if (result.success) {
        setSuccess("¡Gasto agregado exitosamente!")
        if (formRef.current) {
          formRef.current.reset()
        }
        setDate(new Date())
        onSuccess?.()
      } else {
        setError(result.error || "Error al crear el gasto")
      }
    } catch (error) {
      console.error("Error submitting expense:", error)
      setError("Error inesperado al crear el gasto")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Receipt className="h-6 w-6" />
          <span>Nuevo Gasto</span>
        </CardTitle>
        <CardDescription>Registra un nuevo gasto en tu sistema de contabilidad</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">{error}</div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 text-sm">
            {success}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Input
                id="description"
                name="description"
                placeholder="Ej: Almuerzo de negocios"
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Cantidad *</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                required
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select name="category" required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meals">Comidas y Entretenimiento</SelectItem>
                  <SelectItem value="travel">Viajes</SelectItem>
                  <SelectItem value="office">Suministros de Oficina</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="software">Software y Suscripciones</SelectItem>
                  <SelectItem value="utilities">Servicios Públicos</SelectItem>
                  <SelectItem value="professional">Servicios Profesionales</SelectItem>
                  <SelectItem value="other">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Fecha *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor">Proveedor</Label>
            <Input id="vendor" name="vendor" placeholder="Ej: Restaurante El Buen Sabor" className="w-full" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Información adicional sobre este gasto..."
              rows={3}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiptUrl">URL del Recibo (Opcional)</Label>
            <div className="flex space-x-2">
              <Input
                id="receiptUrl"
                name="receiptUrl"
                type="url"
                placeholder="https://ejemplo.com/recibo.pdf"
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (formRef.current) {
                  formRef.current.reset()
                }
                setDate(new Date())
                setError(null)
                setSuccess(null)
              }}
            >
              Limpiar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Crear Gasto"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
