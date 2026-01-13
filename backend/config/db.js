import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;
console.log("-----------------------------------------");
console.log("🛠️  Database Config Check:");
console.log(`   User: ${process.env.DB_USER}`);
console.log(`   Host: ${process.env.DB_HOST}`);
console.log(`   Port: ${process.env.DB_PORT}`);
console.log(`   DB Name: ${process.env.DB_NAME}`);
console.log("-----------------------------------------");
const isProduction = process.env.NODE_ENV === "production";

const connectionString =
  process.env.POSTGRES_URL ||
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

const pool = new Pool({
  connectionString: connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
