"use client"

import { useState } from "react"

import { CardDescription } from "@/components/ui/card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Paintbrush, UploadCloud } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"

export default function ThemeManagerPage() {
  const [activeTheme, setActiveTheme] = useState("dark-professional-neon")
  const [previewDevice, setPreviewDevice] = useState("desktop")

  const themes = [
    {
      id: "dark-professional-neon",
      name: "Dark Professional Neon",
      description: "Elegant dark theme with blue & red neon accents",
    },
    { id: "light-modern", name: "Light Modern", description: "Clean and minimalist light theme" },
    { id: "cyberpunk", name: "Cyberpunk", description: "Gritty, high-tech theme with bold colors" },
    { id: "classic", name: "Classic", description: "Traditional and professional look" },
  ]

  const themeSettings = {
    "dark-professional-neon": {
      primaryColor: "#3388FF", // Blue neon
      secondaryColor: "#FF3366", // Red neon
      accentColor: "#FFD700", // Gold accent
      backgroundColor: "#1A1A2E", // Dark blue-purple
      textColor: "#E0FFFF", // Light cyan
      fontFamily: "Geist Sans",
      neonIntensity: 70,
      particleDensity: 50,
      glowEffect: true,
    },
    "light-modern": {
      primaryColor: "#3B82F6",
      secondaryColor: "#6366F1",
      accentColor: "#FF5733", // Orange accent
      backgroundColor: "#FFFFFF",
      textColor: "#1F2937",
      fontFamily: "Inter",
      neonIntensity: 0,
      particleDensity: 0,
      glowEffect: false,
    },
    // ... other theme settings
  }

  const currentTheme = (themeSettings as any)[activeTheme]

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Theme Manager</h2>
          <Button>Save Theme</Button>
        </div>

        {/* Current Theme Card */}
        <Card className="bg-invoxa-card-bg border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Current Theme</CardTitle>
            <CardDescription className="text-gray-400">Select and manage your active theme.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="theme-select" className="text-gray-300">
                Active Theme
              </Label>
              <Select defaultValue={activeTheme} onChange={(value) => setActiveTheme(value)}>
                <SelectTrigger id="theme-select" className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  {themes.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      {theme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="primary-color" className="text-gray-300">
                Primary Color
              </Label>
              <Input
                id="primary-color"
                type="color"
                defaultValue={currentTheme.primaryColor}
                className="h-10 w-full bg-gray-800 border-gray-700"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="secondary-color" className="text-gray-300">
                Secondary Color
              </Label>
              <Input
                id="secondary-color"
                type="color"
                defaultValue={currentTheme.secondaryColor}
                className="h-10 w-full bg-gray-800 border-gray-700"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="accent-color" className="text-gray-300">
                Accent Color
              </Label>
              <Input
                id="accent-color"
                type="color"
                defaultValue={currentTheme.accentColor}
                className="h-10 w-full bg-gray-800 border-gray-700"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="background-color" className="text-gray-300">
                Background Color
              </Label>
              <Input
                id="background-color"
                type="color"
                defaultValue={currentTheme.backgroundColor}
                className="h-10 w-full bg-gray-800 border-gray-700"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="text-color" className="text-gray-300">
                Text Color
              </Label>
              <Input
                id="text-color"
                type="color"
                defaultValue={currentTheme.textColor}
                className="h-10 w-full bg-gray-800 border-gray-700"
              />
            </div>

            {/* Theme Customization Form */}
            <form className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <Input id="primaryColor" type="color" defaultValue="#007bff" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <Input id="secondaryColor" type="color" defaultValue="#6c757d" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <Input id="accentColor" type="color" defaultValue="#10B981" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fontFamily">Font Family</Label>
                <Select defaultValue="inter">
                  <SelectTrigger id="fontFamily">
                    <SelectValue placeholder="Select font" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inter">Inter</SelectItem>
                    <SelectItem value="roboto">Roboto</SelectItem>
                    <SelectItem value="opensans">Open Sans</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="fontSize">Base Font Size</Label>
                <Slider id="fontSize" defaultValue={[16]} max={20} step={1} />
                <span className="text-sm text-muted-foreground">Current: 16px</span>
              </div>
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="roundedCorners">Enable Rounded Corners</Label>
                <Switch id="roundedCorners" defaultChecked />
              </div>
              <Button type="submit">Apply Theme</Button>
            </form>
          </CardContent>
        </Card>

        {/* Custom CSS/JS Card */}
        <Card className="bg-invoxa-card-bg border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Custom CSS/JS</CardTitle>
            <CardDescription className="text-gray-400">Add custom styles or scripts to your theme.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="custom-css" className="text-gray-300">
                Custom CSS
              </Label>
              <textarea
                id="custom-css"
                rows={8}
                placeholder="/* Add your custom CSS here */"
                className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 text-white font-mono text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="custom-js" className="text-gray-300">
                Custom JavaScript
              </Label>
              <textarea
                id="custom-js"
                rows={8}
                placeholder="// Add your custom JavaScript here"
                className="w-full p-3 rounded-md bg-gray-800 border border-gray-700 text-white font-mono text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="upload-theme" className="text-gray-300">
                Upload Theme Package
              </Label>
              <div className="flex items-center gap-4">
                <Input id="upload-theme" type="file" className="hidden" />
                <Label
                  htmlFor="upload-theme"
                  className="flex items-center justify-center h-10 px-4 border border-dashed border-gray-700 rounded-md cursor-pointer bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                >
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Upload .zip file
                </Label>
                <span className="text-gray-500 text-sm">No file chosen</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Selector */}
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Paintbrush className="w-5 h-5 mr-2 text-green-500" />
                  Available Themes
                </CardTitle>
                <CardDescription className="text-gray-400">Choose a theme or create a new one</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      activeTheme === theme.id
                        ? "border-blue-500/50 bg-blue-500/10"
                        : "border-border hover:border-gray-600"
                    }`}
                    onClick={() => setActiveTheme(theme.id)}
                  >
                    <h3 className="font-medium text-white">{theme.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{theme.description}</p>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full border-gray-600 text-gray-400 hover:bg-muted bg-transparent"
                >
                  <Paintbrush className="w-4 h-4 mr-2" />
                  Create New Theme
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Theme Editor */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Paintbrush className="w-5 h-5 mr-2 text-green-500" />
                  Editing: {themes.find((t) => t.id === activeTheme)?.name}
                </CardTitle>
                <CardDescription className="text-gray-400">Adjust colors, fonts, and effects</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Colors Tab */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Primary Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          type="color"
                          defaultValue={currentTheme.primaryColor}
                          className="w-16 h-10 bg-muted border-border"
                        />
                        <Input
                          defaultValue={currentTheme.primaryColor}
                          className="flex-1 bg-muted border-border text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Secondary Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          type="color"
                          defaultValue={currentTheme.secondaryColor}
                          className="w-16 h-10 bg-muted border-border"
                        />
                        <Input
                          defaultValue={currentTheme.secondaryColor}
                          className="flex-1 bg-muted border-border text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Accent Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          type="color"
                          defaultValue={currentTheme.accentColor}
                          className="w-16 h-10 bg-muted border-border"
                        />
                        <Input
                          defaultValue={currentTheme.accentColor}
                          className="flex-1 bg-muted border-border text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Background Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          type="color"
                          defaultValue={currentTheme.backgroundColor}
                          className="w-16 h-10 bg-muted border-border"
                        />
                        <Input
                          defaultValue={currentTheme.backgroundColor}
                          className="flex-1 bg-muted border-border text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Text Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          type="color"
                          defaultValue={currentTheme.textColor}
                          className="w-16 h-10 bg-muted border-border"
                        />
                        <Input
                          defaultValue={currentTheme.textColor}
                          className="flex-1 bg-muted border-border text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Typography Tab */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Font Family</Label>
                      <Select defaultValue={currentTheme.fontFamily}>
                        <SelectTrigger className="bg-muted border-border text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="Inter">Inter</SelectItem>
                          <SelectItem value="Geist Sans">Geist Sans</SelectItem>
                          <SelectItem value="Geist Mono">Geist Mono</SelectItem>
                          <SelectItem value="Roboto">Roboto</SelectItem>
                          <SelectItem value="Open Sans">Open Sans</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Base Font Size (px)</Label>
                      <Input type="number" defaultValue="16" className="bg-muted border-border text-white" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Heading Font Weight</Label>
                      <Select defaultValue="bold">
                        <SelectTrigger className="bg-muted border-border text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="semibold">Semibold</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Layout Tab */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-white">Border Radius (px)</Label>
                      <Input
                        type="number"
                        defaultValue="8"
                        min="0"
                        max="20"
                        className="bg-muted border-border text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Spacing Scale (rem)</Label>
                      <Input
                        type="number"
                        defaultValue="1.0"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        className="bg-muted border-border text-white"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Compact Mode</Label>
                        <p className="text-sm text-gray-400">Reduce padding and margins</p>
                      </div>
                      <Input type="checkbox" className="bg-muted border-border" />
                    </div>
                  </div>
                </div>

                {/* Effects Tab */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Neon Glow Effect</Label>
                        <p className="text-sm text-gray-400">Add a subtle neon glow to elements</p>
                      </div>
                      <Input
                        type="checkbox"
                        defaultChecked={currentTheme.glowEffect}
                        className="bg-muted border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Neon Intensity (%)</Label>
                      <Input
                        type="number"
                        defaultValue={currentTheme.neonIntensity}
                        min="0"
                        max="100"
                        step="5"
                        className="bg-muted border-border text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Particle Density (%)</Label>
                      <Input
                        type="number"
                        defaultValue={currentTheme.particleDensity}
                        min="0"
                        max="100"
                        step="5"
                        className="bg-muted border-border text-white"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-white">Enable Hover Animations</Label>
                        <p className="text-sm text-gray-400">Interactive animations on hover</p>
                      </div>
                      <Input type="checkbox" defaultChecked className="bg-muted border-border" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <Paintbrush className="w-5 h-5 mr-2 text-purple-500" />
                    Live Preview
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={previewDevice === "mobile" ? "bg-purple-500/20" : ""}
                      onClick={() => setPreviewDevice("mobile")}
                    >
                      <Paintbrush className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={previewDevice === "tablet" ? "bg-purple-500/20" : ""}
                      onClick={() => setPreviewDevice("tablet")}
                    >
                      <Paintbrush className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={previewDevice === "desktop" ? "bg-purple-500/20" : ""}
                      onClick={() => setPreviewDevice("desktop")}
                    >
                      <Paintbrush className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`border border-border rounded-lg overflow-hidden ${
                    previewDevice === "mobile"
                      ? "max-w-sm mx-auto"
                      : previewDevice === "tablet"
                        ? "max-w-md mx-auto"
                        : ""
                  }`}
                  style={{
                    backgroundColor: currentTheme.backgroundColor,
                    fontFamily: currentTheme.fontFamily,
                    boxShadow: currentTheme.glowEffect
                      ? `0 0 ${currentTheme.neonIntensity / 10}px ${currentTheme.primaryColor}`
                      : "none",
                  }}
                >
                  <div className="p-6 text-center">
                    <h2
                      className="text-2xl font-bold mb-2"
                      style={{
                        color: currentTheme.primaryColor,
                        textShadow: currentTheme.glowEffect ? `0 0 8px ${currentTheme.primaryColor}` : "none",
                      }}
                    >
                      INVOXA Preview
                    </h2>
                    <p className="text-sm mb-4" style={{ color: currentTheme.textColor }}>
                      This is how your application will look with the current theme settings.
                    </p>
                    <Button
                      style={{
                        backgroundColor: currentTheme.secondaryColor,
                        color: currentTheme.backgroundColor,
                        boxShadow: currentTheme.glowEffect ? `0 0 5px ${currentTheme.secondaryColor}` : "none",
                      }}
                    >
                      Sample Button
                    </Button>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full border-border text-gray-400 hover:bg-muted bg-transparent"
                  >
                    <Paintbrush className="w-4 h-4 mr-2" />
                    Refresh Preview
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-border text-gray-400 hover:bg-muted bg-transparent"
                  >
                    <Paintbrush className="w-4 h-4 mr-2" />
                    View Live Site
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pre-built Themes Card */}
        <Card>
          <CardHeader>
            <CardTitle>Pre-built Themes</CardTitle>
            <CardDescription>Choose from a selection of ready-to-use themes.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="rounded-lg border p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
              <h3 className="font-semibold">Default Theme</h3>
              <p className="text-sm text-muted-foreground">Clean and modern.</p>
              <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                Activate
              </Button>
            </div>
            <div className="rounded-lg border p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
              <h3 className="font-semibold">Dark Mode Theme</h3>
              <p className="text-sm text-muted-foreground">Optimized for low light.</p>
              <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                Activate
              </Button>
            </div>
            <div className="rounded-lg border p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
              <h3 className="font-semibold">Blue Ocean Theme</h3>
              <p className="text-sm text-muted-foreground">Calm and professional.</p>
              <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                Activate
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button className="bg-gradient-to-r from-blue-500 to-red-500 text-white hover:shadow-lg hover:shadow-blue-500/20">
            Apply Theme
          </Button>
        </div>
      </div>
    </AdminLayout>
  )
}
