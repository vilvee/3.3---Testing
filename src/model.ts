export interface Pokemon {
  id: number;
  name: string;
  type: string;
}

export const database: Pokemon[] = [
  { id: 1, name: "Pikachu", type: "Electric" },
  { id: 2, name: "Bulbasaur", type: "Grass" },
  { id: 3, name: "Charmander", type: "Fire" },
  { id: 4, name: "Squirtle", type: "Water" },
];
