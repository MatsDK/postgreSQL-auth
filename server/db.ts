import { Pool } from "pg";

const pool: Pool = new Pool({
  user: "postgres",
  password: "postgres",
  host: "localhost",
  port: 5432,
  database: "users",
});

export default {
  query: (text: string, params: any[]) => pool.query(text, params),
};
