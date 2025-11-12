/**
 * Application configuration and environment validation
 * This file ensures all required environment variables are present
 */

import { z } from "zod";

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
  
  // OpenAI
  OPENAI_API_KEY: z.string().min(1, "OpenAI API key is required").startsWith("sk-", "Invalid OpenAI API key format"),
  
  // Optional: Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

// Parse and validate environment variables
function validateEnv() {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      NODE_ENV: process.env.NODE_ENV,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
      throw new Error(`❌ Environment validation failed:\n${issues}\n\nPlease check your .env.local file.`);
    }
    throw error;
  }
}

// Validate on import (only in Node.js environment, not during build)
let env: z.infer<typeof envSchema>;

if (typeof window === "undefined") {
  env = validateEnv();
} else {
  // Browser environment - only validate public vars
  env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    OPENAI_API_KEY: "", // Not available in browser
    NODE_ENV: (process.env.NODE_ENV as any) || "development",
  };
}

export const config = {
  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  openai: {
    apiKey: env.OPENAI_API_KEY,
  },
  app: {
    name: "Portfolio Copilot",
    description: "Analyse automatique de documents financiers avec IA",
    isDevelopment: env.NODE_ENV === "development",
    isProduction: env.NODE_ENV === "production",
  },
  limits: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxPdfSize: 20 * 1024 * 1024, // 20MB (OpenAI limit)
    uploadTimeout: 30000, // 30s
    extractTimeout: 120000, // 2min
    maxRetries: 3,
  },
} as const;

export type Config = typeof config;
