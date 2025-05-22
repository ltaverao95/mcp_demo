import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "Demo",
  version: "1.0.0",
});

server.tool(
    "fetch-weather", 
    "Tool to fetch weather data of a city",
    {
        city: z.string().describe("City name"),
    },
    async ({ city }) => {

        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=10&language=en&format=json`);
        const data = await response.json();
        if (data.results.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `No results found for ${city}.`,
                    }
                ]
            }
        }
        const latitude = data.results[0].latitude;
        const longitude = data.results[0].longitude;

        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m&current=temperature_2m,is_day,apparent_temperature,rain`);

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(await weatherResponse.json(), null, 2),
                }
            ]
        }
    }
);

const transport = new StdioServerTransport();
await server.connect(transport);