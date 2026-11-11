import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

const databaseUrl = process.env.DATABASE_URL;
const host = process.env.PGHOST;
const port = process.env.PGPORT;
const username = process.env.PGUSER;
const password = process.env.PGPASSWORD;
const database = process.env.PGDATABASE;

if (!databaseUrl && !(host && username && password && database)) {
  throw new Error(
    'PostgreSQL configuration is missing. Set DATABASE_URL or PGHOST, PGPORT, PGUSER, PGPASSWORD and PGDATABASE.',
  );
}

export default new DataSource({
  type: 'postgres',
  ...(databaseUrl
    ? { url: databaseUrl }
    : {
        host,
        port: Number(port ?? 5432),
        username,
        password,
        database,
      }),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [join(__dirname, '../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
  synchronize: false,
});
