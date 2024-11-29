import { useState } from "react";
import axios from "axios";
import { marked } from "marked"; // Import marked library for Markdown conversion
import backEndUrls from "../utils/urls";
import { Link } from "react-router-dom";
import { PiSignOutDuotone } from "react-icons/pi";
const WebScrapper = () => {
  const [message, setMessage] = useState(""); // URL to scrape
  const [query, setQuery] = useState(""); // User's query
  const [response, setResponse] = useState(""); // Response to display from server
  const [loading, setLoading] = useState(false); // Show loading state
  const [error, setError] = useState(""); // For handling errors
  const [selectedQuestion, setSelectedQuestion] = useState(""); // Track selected predefined question
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const toggleMenu = () => setMenuOpen(!menuOpen);
  // Predefined questions for the user to select
  const predefinedQuestions = [
    "What is the purpose of this website?",
    "Can you summarize the main content?",
    "What are the key features of the site?",
  ];

  // Function to check if the query is a greeting
  // const isGreeting = (query) => {
  //   const greetings = ["hi", "hello", "hey", "hii", "howdy"];
  //   return greetings.some((greeting) => query.toLowerCase().includes(greeting));
  // };

  // Send the URL to the backend server for scraping
  const handleSendMessage = async () => {
    if (!message) {
      setError("Please enter a valid URL");
      return; // Prevent request if the URL is empty
    }

    setError(""); // Clear any previous errors
    setLoading(true); // Show loading indicator
    console.log("Sending request with URL:", message); // Log the URL being sent

    try {
      const token = localStorage.getItem("token"); // Retrieve JWT token from localStorage
      if (!token) {
        setError("You must be logged in to scrape data.");
        return;
      }

      const res = await axios.post(
        `${backEndUrls}/scrape`,
        { url: message },
        { headers: { Authorization: `Bearer ${token}` } } // Include JWT in headers
      );

      console.log("Received response:", res.data);

      if (Array.isArray(res.data.scrapedContent)) {
        const formattedResponse = res.data.scrapedContent
          .map(
            (item, index) =>
              `<strong>Page ${index + 1}: <a href="${item.url}" target="">${
                item.url
              }</a></strong><br /><br />${item.content}<br /><br />`
          )
          .join("");
        setResponse(formattedResponse);
      } else {
        setResponse("No valid content found.");
      }
    } catch (error) {
      console.error("Error during API call:", error);
      setError("Error while scraping. Please try again later.");
      setResponse("");
    } finally {
      setLoading(false);
    }
  };

  // Send the query (or selected question) to the backend for processing
  const handleQuery = async () => {
    const queryToSend = selectedQuestion || query;

    if (!queryToSend) {
      setError("Please enter or select a valid query");
      return;
    }

    setError("");
    setLoading(true);
    console.log("Sending query:", queryToSend);

    try {
      const token = localStorage.getItem("token"); // Retrieve JWT token
      if (!token) {
        setError("You must be logged in to query data.");
        return;
      }

      const res = await axios.post(
        `${backEndUrls}/query`,
        { query: queryToSend },
        { headers: { Authorization: `Bearer ${token}` } } // Include JWT in headers
      );

      console.log("Received AI response:", res.data);

      const htmlResponse = marked(res.data.response);

      let formattedResponse = `
        <strong>AI Analysis:</strong><br />${htmlResponse}<br /><br />
        <strong>Original Content:</strong><br />${res.data.content.join(
          "<br /><br />"
        )}
      `;

      if (res.data.urls && res.data.urls.length > 0) {
        formattedResponse += `
          <br /><br /><strong>Scraped URLs (Sources):</strong><br />
          ${res.data.urls
            .map(
              (url, index) =>
                `<p><strong>Source ${index + 1}:</strong> 
            <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a></p>`
            )
            .join("")}
        `;
      }

      setResponse(formattedResponse);
    } catch (error) {
      console.error("Error during query API call:", error);
      setError("Error while querying. Please try again later.");
      setResponse("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>AI-Enhanced Web Scraping</h1>
      <Link to="/logout">
        <button
          onClick={toggleMenu}
          onMouseEnter={() => setHoveredItem("logout")}
          onMouseLeave={() => setHoveredItem(null)}
          className="flex items-center space-x-2 transition-colors duration-300 hover:text-[#DE8816] text-gray-700"
        >
          {hoveredItem === "logout" && <PiSignOutDuotone className="w-5 h-5" />}
          <span>Logout</span>
        </button>
      </Link>

      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter URL to scrape"
        ></textarea>
        <button onClick={handleSendMessage} disabled={loading}>
          Start Scraping
        </button>
      </div>

      <div>
        {/* Predefined Questions Dropdown */}
        <select
          value={selectedQuestion}
          onChange={(e) => setSelectedQuestion(e.target.value)}
          disabled={loading}
        >
          <option value="">Select a predefined question</option>
          {predefinedQuestions.map((question, index) => (
            <option key={index} value={question}>
              {question}
            </option>
          ))}
        </select>

        {/* User Custom Query Input */}
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
          disabled={selectedQuestion !== ""}
        ></textarea>

        <button onClick={handleQuery} disabled={loading}>
          Submit Query
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {response && <div dangerouslySetInnerHTML={{ __html: response }} />}
    </div>
  );
};

export default WebScrapper;
