const fs = require("fs")
const path = require("path")

console.log("🚀 Setting up Invoxa development environment...\n")

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), ".env.local")
const envExamplePath = path.join(process.cwd(), ".env.example")

if (!fs.existsSync(envLocalPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envLocalPath)
    console.log("✅ Created .env.local from .env.example")
  } else {
    // Create a basic .env.local file
    const basicEnv = `# Invoxa Development Environment
NEXT_PUBLIC_SUPABASE_URL=https://demo-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-anon-key
SUPABASE_SERVICE_ROLE_KEY=demo-service-role-key
DATABASE_URL=postgresql://demo:demo@localhost:5432/invoxa_dev
EXCHANGE_API_KEY=demo-exchange-api-key
RESEND_API_KEY=demo-resend-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
`
    fs.writeFileSync(envLocalPath, basicEnv)
    console.log("✅ Created basic .env.local file")
  }
} else {
  console.log("ℹ️  .env.local already exists")
}

// Check Node.js version
const nodeVersion = process.version
const majorVersion = Number.parseInt(nodeVersion.slice(1).split(".")[0])

if (majorVersion < 18) {
  console.log("⚠️  Warning: Node.js 18+ is recommended")
} else {
  console.log(`✅ Node.js version: ${nodeVersion}`)
}

// Check if node_modules exists
if (!fs.existsSync(path.join(process.cwd(), "node_modules"))) {
  console.log("📦 Installing dependencies...")
  console.log("Run: npm install")
} else {
  console.log("✅ Dependencies installed")
}

console.log("\n🎉 Setup complete!")
console.log("\nNext steps:")
console.log("1. Edit .env.local with your actual API keys")
console.log("2. Run: npm run dev")
console.log("3. Visit: http://localhost:3000/test")
console.log("4. Run tests to verify everything works")
