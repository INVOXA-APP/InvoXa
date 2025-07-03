"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Database, TableIcon, Link, Save, Download, Upload, RefreshCw } from "lucide-react"

interface DatabaseTable {
  id: string
  name: string
  description: string
  columns: Column[]
  rowCount: number
  createdAt: string
  updatedAt: string
}

interface Column {
  id: string
  name: string
  type: string
  nullable: boolean
  primaryKey: boolean
  foreignKey?: string
  defaultValue?: string
}

export function DatabaseManager() {
  const [selectedTable, setSelectedTable] = useState<DatabaseTable | null>(null)
  const [activeTab, setActiveTab] = useState("tables")
  const [isCreateTableOpen, setIsCreateTableOpen] = useState(false)
  const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false)
  const [sqlQuery, setSqlQuery] = useState("")
  const [queryResults, setQueryResults] = useState<any[]>([])

  const tables: DatabaseTable[] = [
    {
      id: "1",
      name: "users",
      description: "Tabla de usuarios del sistema",
      columns: [
        { id: "1", name: "id", type: "uuid", nullable: false, primaryKey: true },
        { id: "2", name: "email", type: "varchar(255)", nullable: false, primaryKey: false },
        { id: "3", name: "name", type: "varchar(100)", nullable: true, primaryKey: false },
        { id: "4", name: "created_at", type: "timestamp", nullable: false, primaryKey: false, defaultValue: "now()" },
        { id: "5", name: "updated_at", type: "timestamp", nullable: false, primaryKey: false, defaultValue: "now()" },
      ],
      rowCount: 1250,
      createdAt: "2024-01-15",
      updatedAt: "2024-01-22",
    },
    {
      id: "2",
      name: "invoices",
      description: "Tabla de facturas",
      columns: [
        { id: "6", name: "id", type: "uuid", nullable: false, primaryKey: true },
        { id: "7", name: "user_id", type: "uuid", nullable: false, primaryKey: false, foreignKey: "users.id" },
        { id: "8", name: "client_id", type: "uuid", nullable: false, primaryKey: false, foreignKey: "clients.id" },
        { id: "9", name: "amount", type: "decimal(10,2)", nullable: false, primaryKey: false },
        { id: "10", name: "status", type: "varchar(20)", nullable: false, primaryKey: false, defaultValue: "'pending'" },
        { id: "11", name: "created_at", type: "timestamp", nullable: false, primaryKey: false, defaultValue: "now()" },
      ],
      rowCount: 3420,
      createdAt: "2024-01-10",
      updatedAt: "2024-01-23",
    },
    {
      id: "3",
      name: "clients",
      description: "Tabla de clientes",
      columns: [
        { id: "12", name: "id", type: "uuid", nullable: false, primaryKey: true },
        { id: "13", name: "name", type: "varchar(100)", nullable: false, primaryKey: false },
        { id: "14", name: "email", type: "varchar(255)", nullable: true, primaryKey: false },
        { id: "15", name: "phone", type: "varchar(20)", nullable: true, primaryKey: false },
        { id: "16", name: "address", type: "text", nullable: true, primaryKey: false },
        { id: "17", name: "created_at", type: "timestamp", nullable: false, primaryKey: false, defaultValue: "now()" },
      ],
      rowCount: 890,
      createdAt: "2024-01-12",
      updatedAt: "2024-01-21",
    },
  ]

  const dataTypes = [
    "varchar(255)", "text", "integer", "bigint", "decimal(10,2)", 
    "boolean", "timestamp", "date", "uuid", "json"
  ]

  const handleCreateTable = () => {
    // Logic to create new table
    setIsCreateTableOpen(false)
  }

  const handleCreateColumn = () => {
    // Logic to create new column
    setIsCreateColumnOpen(false)
  }

  const handleDeleteTable = (id: string) => {
    // Logic to delete table
  }

  const handleExecuteQuery = () => {
    // Logic to execute SQL query
    setQueryResults([
      { id: 1, name: "John Doe", email: "john@example.com" },
      { id: 2, name: "Jane Smith", email: "jane@example.com" },
    ])
  }

  const getTypeIcon = (type: string) => {
    if (type.includes("varchar") || type === "text") return "T"
    if (type.includes("int") || type.includes("decimal")) return "#"
    if (type === "boolean") return "B"
    if (type.includes("timestamp") || type === "date") return "📅"
    if (type === "uuid") return "🔑"
    return "?"
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="border-b bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold">Gestor de Base de Datos</h2>
              <p className="text-muted-foreground">Administra la estructura y datos de tu base de datos</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Importar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </div>
          </div>

          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tables" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              Tablas
            </TabsTrigger>
            <TabsTrigger value="query" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Consultas SQL
            </TabsTrigger>
            <TabsTrigger value="relations" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Relaciones
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Respaldos
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="tables" className="h-full flex m-0">
            {/* Tables List */}
            <div className="w-80 border-r bg-card">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Tablas ({tables.length})</h3>
                  <Dialog open={isCreateTableOpen} onOpenChange={setIsCreateTableOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear Nueva Tabla</DialogTitle>
                        <DialogDescription>
                          Define la estructura de la nueva tabla
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="tableName" className="text-right">
                            Nombre
                          </Label>
                          <Input id="tableName" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="tableDesc" className="text-right">
                            Descripción
                          </Label>
                          <Input id="tableDesc" className="col-span-3" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsCreateTableOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleCreateTable}>Crear Tabla</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <Scroll\
