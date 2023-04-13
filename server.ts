import * as dotenv from "dotenv";
import express, { json } from "express";
import morgan from "morgan";
dotenv.config();
import joi from "joi";
const app = express();

app.use(express.json());
app.use(morgan("dev"));

const port = process.env.PORT_NUMBER || 5000;

type Planet = {
  id: number;
  name: string;
};

type Planets = Planet[];

let planets: Planets = [
  {
    id: 1,
    name: "Earth",
  },
  {
    id: 2,
    name: "Mars",
  },
];

const planetSchmea = joi.object({
  id: joi.number().required(),
  name: joi.string().required(),
});

app.get("/api/planets", (req, res) => {
  res.status(200).json(planets);
});

app.get("/api/planets/:id", (req, res) => {
  const id: number = parseInt(req.params.id);
  const planet: Planet | undefined = planets.find(
    (planet) => planet.id === Number(id)
  );
  if (planet) {
    res.status(200).json(planet);
  } else {
    res.status(404).send("Planet not found");
  }
});

app.post("/api/planets", (req, res) => {
  const { id, name } = req.body;
  const planet: Planet = { id, name };

  const validatedPlanet = planetSchmea.validate(planet);

  if (validatedPlanet.error) {
    res.status(400).json({ msg: "Please include a name or id" });
  } else {
    planets = [...planets, planet];
    res.status(201).json({ msg: "planet added" });
  }
});

app.delete("/api/planets/:id", (req, res) => {
  const id: number = parseInt(req.params.id);
  planets = planets.filter((planet) => planet.id !== id);

  res.status(200).json({ msg: "Planet deleted" });
});

app.put("/api/planets/:id", (req, res) => {
  const id: number = parseInt(req.params.id);
  const { name } = req.body;

  planets.find((planet) => {
    if (planet.id === id) {
      planet.name = name;
      res.status(200).json({ msg: "Planet updated", planet });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
