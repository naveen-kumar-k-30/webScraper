import { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [message, setMessage] = useState(''); // URL to scrape
  const [query, setQuery] = useState(''); // User's query
  const [response, setResponse] = useState(''); // Response to display from server
  const [loading, setLoading] = useState(false); // Show loading state
  const [error, setError] = useState(''); // For handling errors

  // Send the URL to the backend server for scraping
  const handleSendMessage = async () => {
    if (!message) {
      setError('Please enter a valid URL');
      return; // Prevent request if the URL is empty
    }

    setError(''); // Clear any previous errors
    setLoading(true); // Show loading indicator
    console.log('Sending request with URL:', message); // Log the URL being sent

    try {
      // Send URL to backend for scraping
      const res = await axios.post('http://localhost:5000/scrape', {
        url: message,
      });

      console.log('Received response:', res.data); // Log the response from the server

      // Check if the response contains valid content
      if (Array.isArray(res.data.scrapedContent)) {
        const formattedResponse = res.data.scrapedContent.map((item, index) => (
          `<strong>Page ${index + 1}: ${item.url}</strong><br /><br />${item.content}<br /><br />`
        )).join('');

        setResponse(formattedResponse);
      } else {
        setResponse('No valid content found.');
      }

    } catch (error) {
      console.error('Error during API call:', error); // Log any errors
      setError('Error while scraping. Please try again later.');
      setResponse(''); // Clear the previous response if there's an error
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  // Send the query to the backend for processing
  const handleQuery = async () => {
    if (!query) {
      setError('Please enter a valid query');
      return; // Prevent request if the query is empty
    }

    setError(''); // Clear any previous errors
    setLoading(true); // Show loading indicator
    console.log('Sending query:', query); // Log the query being sent

    try {
      // Send query to backend for processing
      const res = await axios.post('http://localhost:5000/query', {
        query,
      });

      console.log('Received AI response:', res.data); // Log the AI response from the server

      setResponse(res.data.response || 'No AI response found.');
    } catch (error) {
      console.error('Error during query API call:', error); // Log any errors
      setError('Error while querying. Please try again later.');
      setResponse(''); // Clear the previous response if there's an error
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };

  return (
    <div>
      <h1>AI-Enhanced Web Scraping</h1>

      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter URL to scrape"
        ></textarea>
        <button onClick={handleSendMessage} disabled={loading}>Start Scraping</button>
      </div>

      <div>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query"
        ></textarea>
        <button onClick={handleQuery} disabled={loading}>Submit Query</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {response && <div dangerouslySetInnerHTML={{ __html: response }} />}
    </div>
  );
};

export default App;
