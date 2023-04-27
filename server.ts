import express, { Request, Response } from "express";
import dotenv from "dotenv";
import pgPromise, { IDatabase } from "pg-promise";
import multer from "multer";

// Load environment variables
dotenv.config();

// Database configuration
const pgp = pgPromise();
const connectionString = process.env.DATABASE_URL as string;
const db: IDatabase<any> = pgp(connectionString);

// Set up Express server
const app = express();
const port = process.env.PORT || 3000;

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Database setup function
async function setupDb() {
  await db.query("DROP TABLE IF EXISTS planets;");
  await db.query(
    `CREATE TABLE planets(
      id SERIAL NOT NULL PRIMARY KEY,
      name TEXT NOT NULL,
      image TEXT
    );`
  );

  await db.query("INSERT INTO planets (name) VALUES ('Earth');");
  await db.query("INSERT INTO planets (name) VALUES ('Mars');");
}

// Initialize the database and start the server
(async () => {
  await setupDb();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
})();

// Routes
app.get("/planets", async (_req: Request, res: Response) => {
  const planets = await db.query("SELECT * FROM planets;");
  res.json(planets);
});

app.post(
  "/planets/:id/image",
  upload.single("image"),
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!req.file) {
      res.status(400).json({ message: "No image file provided." });
      return;
    }

    const imagePath = req.file.path;

    await db.query("UPDATE planets SET image=$2 WHERE id=$1;", [id, imagePath]);
    res.json({ message: "Planet image updated." });
  }
);
