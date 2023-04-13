import * as dotenv from "dotenv";
import express, { json } from "express";
import morgan from "morgan";
dotenv.config();
const app = express();

app.use(express.json());
app.use(morgan("dev"));

const port = process.env.PORT_NUMBER || 5000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

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
