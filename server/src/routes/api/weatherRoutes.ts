import { Router, type Request, type Response } from "express";

const router = Router();

import HistoryService from "../../service/historyService.js";
import WeatherService from "../../service/weatherService.js";

router.post("/", async (req: Request, res: Response) => {
  console.log("Weather POST Request from", req.ip);

  try {
    await HistoryService.addCity(req.body.cityName);
    const data = await WeatherService.getWeatherForCity(req.body.cityName);

    if (!data) {
      throw new Error("Data empty for some reason, idk lol");
    }

    console.log(typeof data);
    console.log(typeof data[0]);

    return res.status(200).json(data);
  } catch (err) {
    console.log("Error processing weather request:", err);
    return res.status(500).json({ error: `Error occurred: ${err}` });
  }
});

router.get("/history", async (req: Request, res: Response) => {
  console.log("History GET Request from", req.ip);

  try {
    const cities = await HistoryService.getCities();
    return res.json(cities).status(200);
  } catch (err) {
    console.log("Error fetching history:", err);
    return res.status(500).json({ error: `Error Occured: ${err}` });
  }
});

router.delete("/history/:id", async (req: Request, res: Response) => {
  console.log("History DELETE Request from", req.ip);

  HistoryService.removeCity(req.params.id);

  return res.status(404);
});

export default router;
