import { ConfigType, registerAs } from "@nestjs/config";

export const dbConfig = registerAs("db", ()=>({
    dbHost: process.env.DB_HOST || 'localhost',
    dbPort: Number(process.env.DB_PORT),
    dbUser: process.env.DB_USERNAME,
    dbPassword: process.env.DB_PASSWORD,
    dbName: process.env.DB_NAME,
}))

export type DbConfigType = ConfigType<typeof dbConfig>;