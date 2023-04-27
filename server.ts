import express, { Request, Response } from "express";
import multer from "multer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { IMain, IDatabase } from "pg-promise";
import pgPromise from "pg-promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const dbConfig = process.env.DATABASE_URL || "";
const pgp: IMain = pgPromise();
const db: IDatabase<{}> = pgp(dbConfig);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET,
    },
    async (jwtPayload, done) => {
      try {
        const user = await db.one("SELECT * FROM users WHERE id = $1", [
          jwtPayload.id,
        ]);
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

const authorize = (req: Request, res: Response, next: express.NextFunction) => {
  passport.authenticate("jwt", { session: false }, (err: any, user: any) => {
    if (err || !user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    req.user = user;
    next();
  })(req, res, next);
};

app.post("/users/signup", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  await db.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
    username,
    hashedPassword,
  ]);

  res.status(201).json({ msg: "Signup successful. Now you can log in." });
});

app.post("/users/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await db.one("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (isValidPassword) {
      const payload = { id: user.id, username: user.username };
      const token = jwt.sign(payload, process.env.SECRET as string, {
        expiresIn: "1h",
      });

      await db.query("UPDATE users SET token=$2 WHERE id=$1", [user.id, token]);
      res.json({ token, id: user.id, username: user.username });
    } else {
      res.status(401).json({ msg: "Invalid password" });
    }
  } catch (error) {
    res.status(401).json({ msg: "User not found" });
  }
});

app.get("/users/logout", authorize, async (req: Request, res: Response) => {
  const userId = (req.user as any).id;
  await db.query("UPDATE users SET token=NULL WHERE id=$1", [userId]);
  res.json({ msg: "User logged out" });
});

app.get("/planets", async (_req: Request, res: Response) => {
  try {
    const planets = await db.query("SELECT * FROM planets;");
    res.json(planets);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching planets" });
  }
});

app.get("/planets/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const planet = await db.one("SELECT * FROM planets WHERE id=$1;", [id]);
    res.json(planet);
  } catch (error) {
    res.status(404).json({ msg: "Planet not found" });
  }
});

app.post("/planets", async (req: Request, res: Response) => {
  const { name } = req.body;

  try {
    await db.query("INSERT INTO planets (name) VALUES ($1);", [name]);
    res.status(201).json({ msg: "Planet created" });
  } catch (error) {
    res.status(500).json({ msg: "Error creating planet" });
  }
});

app.put("/planets/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    await db.query("UPDATE planets SET name=$2 WHERE id=$1;", [id, name]);
    res.json({ msg: "Planet updated" });
  } catch (error) {
    res.status(500).json({ msg: "Error updating planet" });
  }
});

app.delete("/planets/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM planets WHERE id=$1;", [id]);
    res.json({ msg: "Planet deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Error deleting planet" });
  }
});

app.post(
  "/planets/:id/image",
  authorize,
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
