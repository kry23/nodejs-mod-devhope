import express, { Request, Response } from "express";
import dotenv from "dotenv";
import pgPromise, { IDatabase } from "pg-promise";
import multer from "multer";
import passport from "passport";
import passportJWT from "passport-jwt";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

// Set up Passport and JWT strategy
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await db.one("SELECT * FROM users WHERE id = $1", [
        payload.id,
      ]);
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

app.use(passport.initialize());

// Database setup function
async function setupDb() {
  await db.query("DROP TABLE IF EXISTS planets;");
  await db.query(`
    CREATE TABLE planets(
      id SERIAL NOT NULL PRIMARY KEY,
      name TEXT NOT NULL,
      image TEXT
    );
  `);

  await db.query("INSERT INTO planets (name) VALUES ('Earth');");
  await db.query("INSERT INTO planets (name) VALUES ('Mars');");

  await db.query("DROP TABLE IF EXISTS users;");
  await db.query(`
    CREATE TABLE users (
      id SERIAL NOT NULL PRIMARY KEY,
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      token TEXT
    );
  `);
}

// Initialize the database and start the server
(async () => {
  await setupDb();
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
})();

app.use(express.json());

// Routes
app.post("/register", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
    username,
    hashedPassword,
  ]);

  res.status(201).json({ message: "User registered" });
});

app.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await db.one("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (isValidPassword) {
      const payload = { id: user.id };
      const token = jwt.sign(payload, process.env.SECRET as string, {
        expiresIn: "1h",
      });

      await db.query("UPDATE users SET token=$2 WHERE id=$1", [user.id, token]);
      res.json({ message: "Logged in successfully", token });
    } else {
      res.status(401).json({ message: "Invalid password" });
    }
  } catch (error) {
    res.status(401).json({ message: "User not found" });
  }
});

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
