const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const cheerio = require("cheerio");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(bodyParser.json());

// Endpoint to scrape a URL and store its content
app.post("/scrape", async (req, res) => {
    const { url } = req.body;
    try {
        // Fetch the URL content
        const axiosResponse = await axios.get(url);
        const $ = cheerio.load(axiosResponse.data);

        // Extract text content from <p> tags
        let content = "";
        $("div").each((i, el) => {
            content += $(el).text() + "\n";
        });

        // Save to database using Prisma
        const newScrapedData = await prisma.scrapedData.create({
            data: {
                url,
                content,
            },
        });

        res.json({ message: "Scraping successful", content: newScrapedData.content });
    } catch (error) {
        console.error("Error during scraping:", error);
        res.status(500).json({ error: "Scraping failed" });
    }
});

// Endpoint to query scraped data
app.post("/query", async (req, res) => {
    const { query } = req.body;
    try {
        // Find the first matching record
        const data = await prisma.scrapedData.findFirst();
        if (!data) {
            return res.status(404).json({ response: "No scraped data found." });
        }

        // Check if the query is included in the content
        const response = data.content.includes(query)
            ? `Here's what I found: ${query}`
            : "No relevant information found.";
        res.json({ response });
    } catch (error) {
        console.error("Error during query processing:", error);
        res.status(500).json({ error: "Query failed" });
    }
});

// Start the server
app.listen(5000, () => console.log("Server running on port 5000"));
