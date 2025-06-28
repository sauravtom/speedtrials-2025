import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'

const db = new Database('./data.db')

const migrationFile = path.join(process.cwd(), 'drizzle', '0000_blue_blue_blade.sql')
const sql = fs.readFileSync(migrationFile, 'utf8')

// Split by statement breakpoint and execute each statement
const statements = sql.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0)

console.log('Running migration...')

for (const statement of statements) {
  if (statement.startsWith('CREATE') || statement.startsWith('INSERT')) {
    try {
      db.exec(statement)
      console.log('✓ Executed:', statement.split('\n')[0])
    } catch (error) {
      console.error('✗ Failed:', statement.split('\n')[0])
      console.error(error)
    }
  }
}

console.log('Migration completed!')
db.close() 