const fs = require("fs");
const path = require("path");

if (!process.env.DATABASE_URL) {
  try {
    const envPath = path.join(__dirname, "..", ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf8");
      for (const line of envContent.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const [key, ...vals] = trimmed.split("=");
          const val = vals.join("=").replace(/^[\"']|[\"']$/g, "");
          if (key.trim() === "DATABASE_URL" && !process.env.DATABASE_URL) {
            process.env.DATABASE_URL = val.trim();
          }
        }
      }
    }
  } catch (e) {}
}

const schemaPath = path.join(__dirname, "..", "prisma", "schema.prisma");
if (fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, "utf8");
  const dbUrl = (process.env.DATABASE_URL || "").trim();
  const isPostgres =
    dbUrl.startsWith("postgres://") ||
    dbUrl.startsWith("postgresql://") ||
    dbUrl.startsWith("prisma+postgres://");

  const targetProvider = isPostgres ? "postgresql" : "sqlite";
  const regex = /datasource\s+db\s*\{[\s\S]*?provider\s*=\s*"(\w+)"/;
  const match = schema.match(regex);

  if (match && match[1] !== targetProvider) {
    schema = schema.replace(
      /(datasource\s+db\s*\{[\s\S]*?provider\s*=\s*")\w+(")/,
      `$1${targetProvider}$2`
    );
    fs.writeFileSync(schemaPath, schema, "utf8");
    console.log(`[Prisma Synchronizer] Configured datasource provider to '${targetProvider}'.`);
  } else {
    console.log(`[Prisma Synchronizer] Datasource provider is already '${targetProvider}'.`);
  }
}
