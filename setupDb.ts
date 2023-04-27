import db from "./db";

async function setupDb() {
  await db.query("DROP TABLE IF EXISTS planets;");
  await db.query(
    `CREATE TABLE planets(
      id SERIAL NOT NULL PRIMARY KEY,
      name TEXT NOT NULL
    );`
  );

  await db.query("INSERT INTO planets (name) VALUES ('Earth');");
  await db.query("INSERT INTO planets (name) VALUES ('Mars');");
}

setupDb().then(() => {
  console.log("Database setup complete");
  process.exit();
});
