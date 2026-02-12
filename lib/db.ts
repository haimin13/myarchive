import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
});

export async function executeQuery(query: string, values: any[] = []) {
    try {
        const { rows } = await pool.query(query, values);
        return rows;
    } catch (error) {
        console.error('에러 발생:', error);
        throw error;
    }
}