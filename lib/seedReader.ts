import fs from 'fs'
import path from 'path'

export interface SeedUser {
  email: string
  password_hash: string
  name: string
  role: string
}

export interface SeedEvent {
  name: string
  distance_m: number
  min_time_s: number
  unit: string
}

export interface SeedData {
  users: SeedUser[]
  events: SeedEvent[]
}

let seedData: SeedData | null = null

export function getSeedData(): SeedData {
  if (!seedData) {
    const seedPath = path.join(process.cwd(), 'data', 'seed.json')
    const data = fs.readFileSync(seedPath, 'utf8')
    seedData = JSON.parse(data)
  }
  return seedData!
}

export function getSeedEvents(): SeedEvent[] {
  return getSeedData().events
}

export function getSeedUsers(): SeedUser[] {
  return getSeedData().users
}