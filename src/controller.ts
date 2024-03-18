import { IncomingMessage, ServerResponse } from "http";
import { Pokemon, database } from "./model";
import { renderTemplate } from "./view";

export const getHome = async (req: IncomingMessage, res: ServerResponse) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  res.end(await renderTemplate("src/views/HomeView.hbs"));
};

export const getNewForm = async (req: IncomingMessage, res: ServerResponse) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  res.end(await renderTemplate("src/views/NewView.hbs", { title: "Create Pokemon" }));
};

export const getOnePokemon = async (
  req: IncomingMessage,
  res: ServerResponse,
) => {
  const id = Number(req.url?.split("/")[2]);
  const foundPokemon = database.find((pokemon) => pokemon.id === id);

  if (!foundPokemon) {
    res.statusCode = 404;
    res.end(
      await renderTemplate("src/views/ErrorView.hbs", {
        title: "Error",
        message: "Pokemon not found!",
      }),
    );
    return;
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  res.end(
    await renderTemplate("src/views/ShowView.hbs", {
		title: "One Pokemon",
      pokemon: foundPokemon,
    }),
  );
};

export const getAllPokemon = async (
  req: IncomingMessage,
  res: ServerResponse,
) => {
  const url = new URL(req.url!, `http://${req.headers.host}`); // Use URL parsing
  const queryParams = url.searchParams;
  const typeFilter = queryParams.get("type");
  const sortBy = queryParams.get("sortBy");
  let pokemon: Pokemon[] = [];

  pokemon = database.filter((pokemon) => pokemon.type === typeFilter);

  if (sortBy === "name") {
    pokemon = [...pokemon].sort((a, b) => a.name.localeCompare(b.name));
  }

  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html");
  res.end(
    await renderTemplate("src/views/ListView.hbs", {
      title: "All Pokemon",
      pokemn: pokemon,
    }),
  );
};

export const createPokemon = async (
  req: IncomingMessage,
  res: ServerResponse,
) => {
  const body = await parseBody(req);
  let newPokemon;

  /**
   * In this exercise we're not going to handle JSON requests,
   * but I want to show you how you could potentially handle them.
   */
  if (req.headers["content-type"]?.includes("x-www-form-urlencoded")) {
    // application/x-www-form-urlencoded => name=Pikachu&type=Electric
    newPokemon = Object.fromEntries(new URLSearchParams(body).entries());
  } else {
    // application/json => {"name":"Pikachu","type":"Electric"}
    newPokemon = JSON.parse(body);
  }

  newPokemon.id = database.length + 1; // ID "auto-increment".
  database.push(newPokemon);

  if (req.headers["user-agent"]?.includes("Mozilla")) {
    res.statusCode = 303;
    res.setHeader("Location", "/pokemon");
    res.end();
  } else {
    res.statusCode = 201;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(newPokemon));
  }
};

const parseBody = async (req: IncomingMessage) => {
  return new Promise<string>((resolve) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      resolve(body);
    });
  });
};
