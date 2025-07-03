"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Palette,
  Download,
  Upload,
  RotateCcw,
  Save,
  Eye,
  Monitor,
  Smartphone,
  Tablet,
  Type,
  Layout,
} from "lucide-react"

interface ThemeConfig {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
    border: string
  }
  typography: {
    fontFamily: string
    fontSize: number
    lineHeight: number
    fontWeight: number
  }
  spacing: {
    scale: number
    borderRadius: number
  }
  layout: {
    containerWidth: string
    sidebarWidth: string
    headerHeight: string
  }
  darkMode: boolean
}

export function ThemeCustomizer() {
  const [activeTheme, setActiveTheme] = useState<ThemeConfig>({
    name: "INVOXA Default",
    colors: {
      primary: "#3b82f6",
      secondary: "#64748b",
      accent: "#8b5cf6",
      background: "#ffffff",
      foreground: "#0f172a",
      muted: "#f8fafc",
      border: "#e2e8f0",
    },
    typography: {
      fontFamily: "Inter",
      fontSize: 14,
      lineHeight: 1.5,
      fontWeight: 400,
    },
    spacing: {
      scale: 1,
      borderRadius: 8,
    },
    layout: {
      containerWidth: "1200px",
      sidebarWidth: "256px",
      headerHeight: "64px",
    },
    darkMode: false,
  })

  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const presetThemes = [
    {
      name: "INVOXA Default",
      colors: {
        primary: "#3b82f6",
        secondary: "#64748b",
        accent: "#8b5cf6",
        background: "#ffffff",
        foreground: "#0f172a",
        muted: "#f8fafc",
        border: "#e2e8f0",
      },
    },
    {
      name: "Dark Professional",
      colors: {
        primary: "#6366f1",
        secondary: "#94a3b8",
        accent: "#f59e0b",
        background: "#0f172a",
        foreground: "#f8fafc",
        muted: "#1e293b",
        border: "#334155",
      },
    },
    {
      name: "Green Nature",
      colors: {
        primary: "#10b981",
        secondary: "#6b7280",
        accent: "#f59e0b",
        background: "#ffffff",
        foreground: "#111827",
        muted: "#f3f4f6",
        border: "#d1d5db",
      },
    },
    {
      name: "Purple Creative",
      colors: {
        primary: "#8b5cf6",
        secondary: "#6b7280",
        accent: "#ec4899",
        background: "#ffffff",
        foreground: "#1f2937",
        muted: "#f9fafb",
        border: "#e5e7eb",
      },
    },
  ]

  const fontFamilies = ["Inter", "Roboto", "Open Sans", "Lato", "Poppins", "Montserrat", "Source Sans Pro", "Nunito"]

  const updateThemeColor = (colorKey: keyof ThemeConfig["colors"], value: string) => {
    setActiveTheme((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }))
  }

  const updateTypography = (key: keyof ThemeConfig["typography"], value: any) => {
    setActiveTheme((prev) => ({
      ...prev,
      typography: {
        ...prev.typography,
        [key]: value,
      },
    }))
  }

  const updateSpacing = (key: keyof ThemeConfig["spacing"], value: number) => {
    setActiveTheme((prev) => ({
      ...prev,
      spacing: {
        ...prev.spacing,
        [key]: value,
      },
    }))
  }

  const updateLayout = (key: keyof ThemeConfig["layout"], value: string) => {
    setActiveTheme((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        [key]: value,
      },
    }))
  }

  const applyPresetTheme = (preset: (typeof presetThemes)[0]) => {
    setActiveTheme((prev) => ({
      ...prev,
      name: preset.name,
      colors: preset.colors,
    }))
  }

  const resetTheme = () => {
    setActiveTheme(presetThemes[0] as any)
  }

  const exportTheme = () => {
    const dataStr = JSON.stringify(activeTheme, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `${activeTheme.name.toLowerCase().replace(/\s+/g, "-")}-theme.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const generateCSS = () => {
    return `
:root {
  --primary: ${activeTheme.colors.primary};
  --secondary: ${activeTheme.colors.secondary};
  --accent: ${activeTheme.colors.accent};
  --background: ${activeTheme.colors.background};
  --foreground: ${activeTheme.colors.foreground};
  --muted: ${activeTheme.colors.muted};
  --border: ${activeTheme.colors.border};
  
  --font-family: ${activeTheme.typography.fontFamily};
  --font-size: ${activeTheme.typography.fontSize}px;
  --line-height: ${activeTheme.typography.lineHeight};
  --font-weight: ${activeTheme.typography.fontWeight};
  
  --border-radius: ${activeTheme.spacing.borderRadius}px;
  --spacing-scale: ${activeTheme.spacing.scale};
  
  --container-width: ${activeTheme.layout.containerWidth};
  --sidebar-width: ${activeTheme.layout.sidebarWidth};
  --header-height: ${activeTheme.layout.headerHeight};
}
    `.trim()
  }

  return (
    <div className="h-full flex">
      {/* Theme Controls */}
      <div className="w-80 border-r bg-card overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Personalizador de Tema</h3>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={resetTheme}>
                <RotateCcw className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" onClick={exportTheme}>
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="colors" className="text-xs">
                <Palette className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="typography" className="text-xs">
                <Type className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="spacing" className="text-xs">
                <Layout className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="layout" className="text-xs">
                <Monitor className="h-3 w-3" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Temas Predefinidos</Label>
                <div className="grid grid-cols-2 gap-2">
                  {presetThemes.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPresetTheme(preset)}
                      className="h-auto p-2 flex flex-col items-start bg-transparent"
                    >
                      <div className="flex gap-1 mb-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.colors.primary }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.colors.secondary }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.colors.accent }} />
                      </div>
                      <span className="text-xs">{preset.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm">Color Primario</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={activeTheme.colors.primary}
                      onChange={(e) => updateThemeColor("primary", e.target.value)}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={activeTheme.colors.primary}
                      onChange={(e) => updateThemeColor("primary", e.target.value)}
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Color Secundario</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={activeTheme.colors.secondary}
                      onChange={(e) => updateThemeColor("secondary", e.target.value)}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={activeTheme.colors.secondary}
                      onChange={(e) => updateThemeColor("secondary", e.target.value)}
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Color de Acento</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={activeTheme.colors.accent}
                      onChange={(e) => updateThemeColor("accent", e.target.value)}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={activeTheme.colors.accent}
                      onChange={(e) => updateThemeColor("accent", e.target.value)}
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Fondo</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={activeTheme.colors.background}
                      onChange={(e) => updateThemeColor("background", e.target.value)}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={activeTheme.colors.background}
                      onChange={(e) => updateThemeColor("background", e.target.value)}
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Texto Principal</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={activeTheme.colors.foreground}
                      onChange={(e) => updateThemeColor("foreground", e.target.value)}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={activeTheme.colors.foreground}
                      onChange={(e) => updateThemeColor("foreground", e.target.value)}
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm">Bordes</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={activeTheme.colors.border}
                      onChange={(e) => updateThemeColor("border", e.target.value)}
                      className="w-12 h-8 p-1"
                    />
                    <Input
                      value={activeTheme.colors.border}
                      onChange={(e) => updateThemeColor("border", e.target.value)}
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm">Modo Oscuro</Label>
                <Switch
                  checked={activeTheme.darkMode}
                  onCheckedChange={(checked) => setActiveTheme((prev) => ({ ...prev, darkMode: checked }))}
                />
              </div>
            </TabsContent>

            <TabsContent value="typography" className="space-y-4">
              <div>
                <Label className="text-sm">Familia de Fuente</Label>
                <Select
                  value={activeTheme.typography.fontFamily}
                  onValueChange={(value) => updateTypography("fontFamily", value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilies.map((font) => (
                      <SelectItem key={font} value={font}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Tamaño de Fuente Base</Label>
                <div className="mt-2">
                  <Slider
                    value={[activeTheme.typography.fontSize]}
                    onValueChange={([value]) => updateTypography("fontSize", value)}
                    min={12}
                    max={18}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>12px</span>
                    <span>{activeTheme.typography.fontSize}px</span>
                    <span>18px</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm">Altura de Línea</Label>
                <div className="mt-2">
                  <Slider
                    value={[activeTheme.typography.lineHeight]}
                    onValueChange={([value]) => updateTypography("lineHeight", value)}
                    min={1.2}
                    max={2}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1.2</span>
                    <span>{activeTheme.typography.lineHeight}</span>
                    <span>2.0</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm">Peso de Fuente</Label>
                <div className="mt-2">
                  <Slider
                    value={[activeTheme.typography.fontWeight]}
                    onValueChange={([value]) => updateTypography("fontWeight", value)}
                    min={300}
                    max={700}
                    step={100}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>300</span>
                    <span>{activeTheme.typography.fontWeight}</span>
                    <span>700</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="spacing" className="space-y-4">
              <div>
                <Label className="text-sm">Escala de Espaciado</Label>
                <div className="mt-2">
                  <Slider
                    value={[activeTheme.spacing.scale]}
                    onValueChange={([value]) => updateSpacing("scale", value)}
                    min={0.8}
                    max={1.5}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0.8x</span>
                    <span>{activeTheme.spacing.scale}x</span>
                    <span>1.5x</span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm">Radio de Bordes</Label>
                <div className="mt-2">
                  <Slider
                    value={[activeTheme.spacing.borderRadius]}
                    onValueChange={([value]) => updateSpacing("borderRadius", value)}
                    min={0}
                    max={20}
                    step={2}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0px</span>
                    <span>{activeTheme.spacing.borderRadius}px</span>
                    <span>20px</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layout" className="space-y-4">
              <div>
                <Label className="text-sm">Ancho del Contenedor</Label>
                <Input
                  value={activeTheme.layout.containerWidth}
                  onChange={(e) => updateLayout("containerWidth", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm">Ancho del Sidebar</Label>
                <Input
                  value={activeTheme.layout.sidebarWidth}
                  onChange={(e) => updateLayout("sidebarWidth", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm">Altura del Header</Label>
                <Input
                  value={activeTheme.layout.headerHeight}
                  onChange={(e) => updateLayout("headerHeight", e.target.value)}
                  className="mt-1"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-4 border-t space-y-2">
            <Button className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Guardar Tema
            </Button>
            <Button variant="outline" className="w-full bg-transparent">
              <Upload className="h-4 w-4 mr-2" />
              Importar Tema
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex flex-col">
        {/* Preview Controls */}
        <div className="border-b bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Vista Previa del Tema</h3>
              <p className="text-sm text-muted-foreground">{activeTheme.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 border rounded-lg p-1">
                <Button
                  variant={previewMode === "desktop" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewMode("desktop")}
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewMode === "tablet" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewMode("tablet")}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={previewMode === "mobile" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPreviewMode("mobile")}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
              <Button variant={isPreviewMode ? "default" : "outline"} onClick={() => setIsPreviewMode(!isPreviewMode)}>
                <Eye className="h-4 w-4 mr-2" />
                {isPreviewMode ? "Editar" : "Vista Previa"}
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 p-6 bg-muted/20">
          <div
            className={`mx-auto bg-white border shadow-lg transition-all duration-300 ${
              previewMode === "desktop"
                ? "w-full h-full"
                : previewMode === "tablet"
                  ? "w-[768px] h-[600px]"
                  : "w-[375px] h-[600px]"
            }`}
            style={{
              backgroundColor: activeTheme.colors.background,
              color: activeTheme.colors.foreground,
              fontFamily: activeTheme.typography.fontFamily,
              fontSize: `${activeTheme.typography.fontSize}px`,
              lineHeight: activeTheme.typography.lineHeight,
              borderRadius: `${activeTheme.spacing.borderRadius}px`,
            }}
          >
            {/* Mock Header */}
            <div
              className="border-b px-6 py-4"
              style={{
                height: activeTheme.layout.headerHeight,
                borderColor: activeTheme.colors.border,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: activeTheme.colors.primary }}
                  >
                    IX
                  </div>
                  <span className="font-bold">INVOXA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    style={{
                      backgroundColor: activeTheme.colors.primary,
                      color: "white",
                      borderRadius: `${activeTheme.spacing.borderRadius}px`,
                    }}
                  >
                    Botón Primario
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    style={{
                      borderColor: activeTheme.colors.border,
                      borderRadius: `${activeTheme.spacing.borderRadius}px`,
                    }}
                  >
                    Secundario
                  </Button>
                </div>
              </div>
            </div>

            {/* Mock Content */}
            <div className="flex h-full">
              {/* Mock Sidebar */}
              <div
                className="border-r p-4"
                style={{
                  width: activeTheme.layout.sidebarWidth,
                  borderColor: activeTheme.colors.border,
                  backgroundColor: activeTheme.colors.muted,
                }}
              >
                <div className="space-y-2">
                  {["Dashboard", "Facturas", "Clientes", "Reportes"].map((item, index) => (
                    <div
                      key={item}
                      className="p-2 rounded cursor-pointer"
                      style={{
                        backgroundColor: index === 0 ? activeTheme.colors.primary : "transparent",
                        color: index === 0 ? "white" : activeTheme.colors.foreground,
                        borderRadius: `${activeTheme.spacing.borderRadius}px`,
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mock Main Content */}
              <div className="flex-1 p-6">
                <div className="space-y-6">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
                    <p style={{ color: activeTheme.colors.secondary }}>Bienvenido a tu panel de control</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { title: "Total Revenue", value: "$45,231.89", change: "+20.1%" },
                      { title: "Invoices", value: "254", change: "+12.5%" },
                      { title: "Clients", value: "48", change: "+8.2%" },
                    ].map((stat, index) => (
                      <div
                        key={stat.title}
                        className="p-4 border rounded-lg"
                        style={{
                          borderColor: activeTheme.colors.border,
                          borderRadius: `${activeTheme.spacing.borderRadius}px`,
                        }}
                      >
                        <div className="text-sm" style={{ color: activeTheme.colors.secondary }}>
                          {stat.title}
                        </div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-sm" style={{ color: activeTheme.colors.accent }}>
                          {stat.change} from last month
                        </div>
                      </div>
                    ))}
                  </div>

                  <div
                    className="p-4 border rounded-lg"
                    style={{
                      borderColor: activeTheme.colors.border,
                      borderRadius: `${activeTheme.spacing.borderRadius}px`,
                    }}
                  >
                    <h3 className="font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-2">
                      {["Nueva factura creada", "Cliente agregado", "Pago recibido"].map((activity, index) => (
                        <div key={activity} className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: activeTheme.colors.accent }}
                          />
                          <span>{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CSS Output */}
        {!isPreviewMode && (
          <div className="border-t bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">CSS Generado</Label>
              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(generateCSS())}>
                Copiar CSS
              </Button>
            </div>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto max-h-32">{generateCSS()}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
