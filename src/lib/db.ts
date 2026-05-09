import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

type GlobalCache = {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

const globalCache = globalThis as unknown as GlobalCache;

function isPlaceholderDbUrl(url: string) {
  return url.includes("johndoe:randompassword") || url.includes("localhost:5432/mydb");
}

export function getPrisma() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url || isPlaceholderDbUrl(url)) return null;

  if (globalCache.prisma) return globalCache.prisma;

  const pool =
    globalCache.pgPool ??
    new Pool({
      connectionString: url,
    });
  globalCache.pgPool = pool;

  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") globalCache.prisma = prisma;
  return prisma;
}

