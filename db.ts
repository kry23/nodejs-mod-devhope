import pgPromise, { IDatabase } from "pg-promise";
import dotenv from "dotenv";

dotenv.config();
const pgp = pgPromise();
const connectionString = process.env.DATABASE_URL as string;
const db: IDatabase<any> = pgp(connectionString);

export default db;
