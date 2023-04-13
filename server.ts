import * as dotenv from "dotenv";
import express, { json } from "express";
import morgan from "morgan";
dotenv.config();

import {
  addPlanet,
  deletePlanet,
  getAllPlanets,
  getPlanetById,
  updatePlanet,
} from "./controllers/planets.js";
const app = express();

app.use(express.json());
app.use(morgan("dev"));

const port = process.env.PORT_NUMBER || 5000;

app.get("/api/planets", getAllPlanets);

app.get("/api/planets/:id", getPlanetById);

app.post("/api/planets", addPlanet);

app.delete("/api/planets/:id", deletePlanet);

app.put("/api/planets/:id", updatePlanet);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
