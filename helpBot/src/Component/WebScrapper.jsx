import { useState } from "react";
import axios from "axios";

const WebScraper = () => {
    const [url, setUrl] = useState("");
    const [query, setQuery] = useState("");
    const [response, setResponse] = useState("");

    const handleScrape = async () => {
        try {
            const scrapeResponse = await axios.post("http://localhost:5000/scrape", { url });
            console.log("Scraping successful:", scrapeResponse.data);
        } catch (error) {
            console.error("Error scraping:", error);
        }
    };

    const handleQuery = async () => {
        try {
            const queryResponse = await axios.post("http://localhost:5000/query", { query });
            setResponse(queryResponse.data.response);
        } catch (error) {
            console.error("Error fetching query response:", error);
        }
    };

    return (
        <div>
            <h1>Web Scraper Bot</h1>
            <input
                type="text"
                placeholder="Enter URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
            />
            <button onClick={handleScrape}>Scrape</button>
            <br />
            <input
                type="text"
                placeholder="Ask your query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={handleQuery}>Ask</button>
            <p>Response: {response}</p>
        </div>
    );
};

export default WebScraper;
