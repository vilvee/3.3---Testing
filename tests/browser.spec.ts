import { test, expect } from "@playwright/test";
import { getPath } from "../src/url";
import { database } from "../src/model";

test("Homepage was retrieved successfully!", async ({ page }) => {
  await page.goto("/");

  expect(await page?.title()).toBe("Welcome");

  /**
   * The $ method is used to query for an element on the page.
   * It's equivalent to document.querySelector in the browser which
   * returns the first element that matches the specified CSS selector.
   * @see https://playwright.dev/docs/api/class-page#page-queryselector
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
   */
  const h1 = await page.$("h1");
  const homeNavLink = await page.$(`nav a[href="${getPath()}"]`); // @see https://www.w3schools.com/css/css_attribute_selectors.asp
  const listPokemonLink = await page.$(`nav a[href="${getPath("pokemon")}"]`);
  const newPokemonLink = await page.$(
    `nav a[href="${getPath("pokemon/new")}"]`,
  );
  const footer = await page.$("footer");

  expect(h1).not.toBeNull();
  expect(homeNavLink).not.toBeNull();
  expect(listPokemonLink).not.toBeNull();
  expect(newPokemonLink).not.toBeNull();
  expect(footer).not.toBeNull();

  expect(await h1?.innerText()).toBe("Welcome to the Pokedex!");
  expect(await homeNavLink?.innerText()).toBe("Home");
  expect(await listPokemonLink?.innerText()).toBe("List All Pokemon");
  expect(await newPokemonLink?.innerText()).toBe("Create Pokemon");
  expect(await footer?.innerText()).toBe("© Copyright 2024 Vikram Singh");
});

test("Invalid path returned error.", async ({ page }) => {
  await page.goto(getPath("digimon"));

  const h1 = await page.$("h1");
  const body = await page.$("body");

  expect(await h1?.innerText()).toMatch("Error");
  expect(await body?.innerText()).toMatch("Route not found");
});

test("Pokemon found by ID.", async ({ page }) => {
  const pokemon = { id: "1", name: "Pikachu", type: "Electric" };

  await page.goto(getPath("pokemon/:id", { id: pokemon.id }));

  const nameElement = await page.$("#name");
  const typeElement = await page.$("#type");

  expect(await nameElement?.innerText()).toBe(pokemon.name);
  expect(await typeElement?.innerText()).toBe(pokemon.type);
});

test("All Pokemon were found.", async ({ page }) => {
  await page.goto(getPath());
  await page.click(`a[href="${getPath("pokemon")}"]`);

  const h1 = await page.$("h1");
  const tableRows = await page.$$("tbody > tr");

  expect(await h1?.innerText()).toMatch("All Pokemon");
  expect(tableRows.length).toBe(database.length);

  for (let i = 0; i < tableRows.length; i++) {
    expect(await tableRows[i].innerText()).toMatch(database[i].name);
    expect(await tableRows[i].innerText()).toMatch(database[i].type);
  }
});

test("Pokemon created successfully.", async ({ page }) => {
  const pokemonData = { name: "Pikachu", type: "Electric" };

  await page.goto(getPath());
  await page.click(`a[href="${getPath("pokemon/new")}"]`);

  const h1 = await page.$("h1");

  expect(await h1?.innerText()).toMatch("Create New Pokemon");

  await page.fill('form#new-pokemon-form input[name="name"]', pokemonData.name);
  await page.fill('form#new-pokemon-form input[name="type"]', pokemonData.type);
  await page.click("form#new-pokemon-form button");

  const foundPokemon = database.find(
    (pokemon) => pokemon.name === pokemonData.name,
  );

  if (!foundPokemon) {
    throw new Error(`Pokemon not found: ${pokemonData.name}`);
  }

  expect(await page?.url()).toBe(getPath(`pokemon`));

  const table = await page.$("table");

  expect(await table?.innerText()).toMatch(pokemonData.name);
  expect(await table?.innerText()).toMatch(pokemonData.type);
});
