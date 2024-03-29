import { resolve } from 'node:path'
import { bgCyan, black } from 'kolorist'

export const port = Number.parseInt(process.env.PORT || '') || 3303
export const r = (...args: string[]) => resolve(__dirname, '..', ...args)
export const isDev = process.env.NODE_ENV !== 'production'

export function log(name: string, message: string) {
  console.log(black(bgCyan(` ${name} `)), message)
}
