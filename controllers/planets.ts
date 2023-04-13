import { Request, Response } from "express";
import joi from "joi";
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
const getAllPlanets = (req: Request, res: Response) => {
  return res.status(200).json(planets);
};

const getPlanetById = (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id);
  const planet: Planet | undefined = planets.find(
    (planet) => planet.id === Number(id)
  );
  if (planet) {
    res.status(200).json(planet);
  } else {
    res.status(404).send("Planet not found");
  }
};
const addPlanet = (req: Request, res: Response) => {
  const { id, name } = req.body;
  const planet: Planet = { id, name };

  const validatedPlanet = planetSchmea.validate(planet);

  if (validatedPlanet.error) {
    res.status(400).json({ msg: "Please include a name or id" });
  } else {
    planets = [...planets, planet];
    res.status(201).json({ msg: "planet added" });
  }
};

const deletePlanet = (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id);
  planets = planets.filter((planet) => planet.id !== id);

  res.status(200).json({ msg: "Planet deleted" });
};

const updatePlanet = (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id);
  const { name } = req.body;

  planets.map((planet) => {
    if (planet.id === id) {
      planet.name = name;
      res.status(200).json({ msg: "Planet updated", planet });
    }
  });
};

export { getAllPlanets, getPlanetById, addPlanet, deletePlanet, updatePlanet };
