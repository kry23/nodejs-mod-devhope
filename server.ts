import express from "express";
import db from "./db.js";

const app = express();
const port = 3000;

app.use(express.json());

app.get("/planets", async (req, res) => {
  const planets = await db.query("SELECT * FROM planets;");
  res.json(planets);
});

app.get("/planets/:id", async (req, res) => {
  const { id } = req.params;
  const planet = await db.oneOrNone("SELECT * FROM planets WHERE id=$1;", [id]);
  res.json(planet);
});

app.post("/planets", async (req, res) => {
  const { name } = req.body;
  await db.query("INSERT INTO planets (name) VALUES ($1);", [name]);
  res.json({ message: "Planet added." });
});

app.put("/planets/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  await db.query("UPDATE planets SET name=$2 WHERE id=$1;", [id, name]);
  res.json({ message: "Planet updated." });
});

app.delete("/planets/:id", async (req, res) => {
  const { id } = req.params;
  await db.query("DELETE FROM planets WHERE id=$1;", [id]);
  res.json({ message: "Planet deleted." });
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
