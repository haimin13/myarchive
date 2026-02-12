import mysql from 'mysql2/promise'

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10, // 연결을 최대 10개까지 미리 만들어둠
  queueLimit: 0,
  dateStrings: true,
});

export async function executeQuery(query: string, values: any[] = []) {
    try {
        const [results] = await pool.execute(query, values);
        return results;
    } catch (error) {
        console.error('에러 발생:', error);
        throw error;
    }
}