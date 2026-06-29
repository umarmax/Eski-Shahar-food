import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const rawDatabaseUrl = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/choyxona'
const databaseUrl = rawDatabaseUrl.includes('supabase.co') && !rawDatabaseUrl.includes('sslmode=')
  ? `${rawDatabaseUrl}?sslmode=require`
  : rawDatabaseUrl

const pool = new Pool({ connectionString: databaseUrl })
const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
