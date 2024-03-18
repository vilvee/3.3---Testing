import { promises as fs } from "fs";
import handlebars from "handlebars";
import { getImagesPath, getPath, getStylesPath } from "./url";

/**
 * Reads the template file from the file system and compiles it.
 * @param {string} path The path to a .hbs file.
 */
const compileTemplate = async (path: string) =>
  handlebars.compile((await fs.readFile(path)).toString());

/**
 * Reads the template from the file system and registers the compiled template as a Handlebars partial.
 * @param {string} name The name the partial will be referenced by in other templates.
 * @param {string} path The path to a .hbs file.
 */
export const registerPartialTemplate = async (name: string, path: string) =>
  handlebars.registerPartial(name, await compileTemplate(path));

/**
 * Merges the template placeholders and data together and returns an HTML string.
 * @param {string} path The path to a .hbs file.
 * @param {object} data The data to merge with the template.
 * @returns {Promise<string>} A string of valid HTML.
 */
export const renderTemplate = async (path: string, data: object = {}) =>
  (await compileTemplate(path))(data);

handlebars.registerHelper(
  "path",
  (path = "", parameters?: Record<string, string>) => getPath(path, parameters),
);
handlebars.registerHelper("styles", (path) => getStylesPath(path));
handlebars.registerHelper("images", (path) => getImagesPath(path));
