const fs = require("fs")
const path = require("path")

console.log("🧪 Testing environment configuration...\n")

// Load environment variables
require("dotenv").config({ path: ".env.local" })

const requiredVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "EXCHANGE_API_KEY",
  "NEXT_PUBLIC_SITE_URL",
]

const optionalVars = ["SUPABASE_SERVICE_ROLE_KEY", "DATABASE_URL", "RESEND_API_KEY", "OPENAI_API_KEY"]

let allGood = true

console.log("Required Environment Variables:")
requiredVars.forEach((varName) => {
  const value = process.env[varName]
  if (value) {
    if (value.includes("demo") || value.includes("your-")) {
      console.log(`⚠️  ${varName}: Using demo value`)
    } else {
      console.log(`✅ ${varName}: Configured`)
    }
  } else {
    console.log(`❌ ${varName}: Missing`)
    allGood = false
  }
})

console.log("\nOptional Environment Variables:")
optionalVars.forEach((varName) => {
  const value = process.env[varName]
  if (value) {
    if (value.includes("demo") || value.includes("your-")) {
      console.log(`⚠️  ${varName}: Using demo value`)
    } else {
      console.log(`✅ ${varName}: Configured`)
    }
  } else {
    console.log(`ℹ️  ${varName}: Not set (optional)`)
  }
})

console.log("\n" + "=".repeat(50))

if (allGood) {
  console.log("🎉 Environment looks good!")
  console.log("You can start the development server with: npm run dev")
} else {
  console.log("⚠️  Some required variables are missing.")
  console.log("Please check your .env.local file.")
}

console.log("\nFor testing, visit: http://localhost:3000/test")
