import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import 'dotenv/config'
import pg from 'pg'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL не найден в файле .env')
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)

export const dbClient = new PrismaClient({ adapter })