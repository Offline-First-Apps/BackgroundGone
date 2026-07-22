import { env } from "@backgroundgone/env/server";
import { PrismaLibSql } from "@prisma/adapter-libsql";

import { PrismaClient } from "../prisma/generated/client";

export function createPrismaClient() {
  const adapter = new PrismaLibSql({
    url: env.DATABASE_URL,
    // Present for remote Turso databases; omitted for local file: URLs.
    authToken: env.TURSO_AUTH_TOKEN,
  });

  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();
export default prisma;
