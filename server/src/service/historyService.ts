import fs from "node:fs/promises";
import { v4 as uuidv4 } from "uuid";

class City {
  name: string;
  id: string;

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}

class HistoryService {
  private async read() {
    return await fs.readFile("db/searchHistory.json", "utf-8");
  }

  private async write(cities: City[]) {
    console.log(cities);
    await fs.writeFile(
      "db/searchHistory.json",
      JSON.stringify(cities),
      "utf-8"
    );
  }

  async getCities(): Promise<City[]> {
    const data: string = await this.read();
    return JSON.parse(data);
  }

  async addCity(city: string) {
    try {
      let exists = false;
      console.log("Attempting to add", city, "to history...");
      const cities: City[] = await this.getCities();
      cities.forEach((cityItem) => {
        if (city == cityItem.name) {
          console.log(city, "is already exists");
          exists = true;
        }
      });
      if (!exists) {
        console.log("Successfully added city to history");
        cities.push(new City(city, uuidv4()));
        await this.write(cities);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async removeCity(id: string) {
    console.log("Attempting to remove", id, "from history.");
    try {
      const cities = await this.getCities();
      for (let i = 0; i < cities.length; i++) {
        if (cities[i].id == id) {
          console.log(
            'Found matching ID! Attempting to remove city "' +
              cities[i].name +
              '".'
          );
          cities.splice(i);
          console.log("Success!");
          this.write(cities);
        }
      }
    } catch (err) {
      console.log("Error removing city with id", id + ":", err);
    }
  }
}

export default new HistoryService();
