const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const playwright = require("playwright");
const url = require("url");
const cors = require("cors");
const cheerio = require("cheerio"); // For parsing HTML and extracting links
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { GoogleGenerativeAI } = require("@google/generative-ai"); // Import the GoogleGenerativeAI client

const fileUploadRoutes = require("./routes/fileExtractor");
const app = express();
const port = 5000;

// Middleware to handle CORS and JSON parsing
app.use(cors());
app.use(express.json());
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
//---default route
app.get("/", async (req, res) => {
  try {
    // Attempt to connect to the database
    await prisma.$connect();
    const message = "Welcome, BackEnd connected successfully";
    res.json({
      message: message,
      success: true,
      status: "OK",
      details: "Connected to the database!",
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
    res.status(500).json({
      success: false,
      status: "ERROR",
      message: "Failed to connect to the database.",
    });
  } finally {
    await prisma.$disconnect();
  }
});

//---api route to handle file upload
app.use("/api", fileUploadRoutes);

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY); // Use your GEMINI API key from .env
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Function to extract internal links from a page
const extractInternalLinks = (baseUrl, pageContent, visited) => {
  const $ = cheerio.load(pageContent);
  const links = [];

  // Find all anchor tags with href attributes
  $("a").each((_, element) => {
    let href = $(element).attr("href");
    if (href) {
      // Resolve relative links to absolute ones
      const absoluteUrl = url.resolve(baseUrl, href);

      // Ensure it's part of the same domain and not external, also check if it's already visited
      if (absoluteUrl.startsWith(baseUrl) && !visited.has(absoluteUrl)) {
        links.push(absoluteUrl); // Only keep links from the same domain
      }
    }
  });

  return links;
};

// Function to scrape content from a single page
const scrapePage = async (pageUrl, browser) => {
  const page = await browser.newPage();
  await page.goto(pageUrl, { waitUntil: "domcontentloaded" });

  // Get the full HTML content of the page
  const pageContent = await page.content(); // Playwright fetches the full HTML
  const title = await page.title();
  const textContent = await page.evaluate(() => document.body.innerText);

  await page.close();

  return {
    url: pageUrl,
    title,
    content: textContent,
    html: pageContent,
  };
};

// Function to crawl the given URL and scrape all internal pages
const crawlAndScrape = async (startUrl, browser) => {
  const visited = new Set(); // To avoid revisiting the same page
  const toVisit = [startUrl]; // Pages to visit
  let scrapedContent = [];

  while (toVisit.length > 0) {
    const currentUrl = toVisit.pop();
    if (visited.has(currentUrl)) continue; // Skip already visited pages
    visited.add(currentUrl);

    try {
      console.log("Visiting:", currentUrl); // Log the URL being visited
      // Scrape the current page
      const pageData = await scrapePage(currentUrl, browser);
      scrapedContent.push(pageData);

      // Get the internal links on this page
      const links = extractInternalLinks(currentUrl, pageData.html, visited);
      console.log("Found links:", links); // Log the links found on the page

      // Add new links to the queue
      links.forEach((link) => {
        if (!visited.has(link)) {
          toVisit.push(link);
        }
      });
    } catch (err) {
      console.error(`Error scraping page ${currentUrl}:`, err);
    }
  }

  return scrapedContent;
};
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to authenticate user' });
  }
});

// POST request to handle user sign-up
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    res.status(201).json({ msg: "User registered successfully", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register user' });
  }
});
// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer token format
  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to authenticate token' });
    }
    req.userId = decoded.id; // Save user ID for future use
    next();
  });
};


// Route to scrape content from the provided URL (with JWT authentication)
app.post('/scrape', authenticate, async (req, res) => {
  const { url: startUrl } = req.body;

  if (!startUrl) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const browser = await playwright.chromium.launch({ headless: true });
    const scrapedContent = await crawlAndScrape(startUrl, browser);
    await browser.close();

    for (const page of scrapedContent) {
      await prisma.scrapedData.create({
        data: {
          title: page.title,
          content: page.content,
          url: page.url,
          userId: req.userId, // Save data for the logged-in user
        },
      });
    }

    res.json({ scrapedContent });
  } catch (error) {
    console.error('Error during scraping:', error);
    res.status(500).json({ error: 'Failed to scrape the URL. Please try again later.' });
  }
});


// Route to query scraped data (with JWT authentication)
app.post('/query', authenticate, async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    const normalizedQuery = query.toLowerCase();

    const scrapedData = await prisma.scrapedData.findMany({
      where: { userId: req.userId }, // Fetch data only for the logged-in user
    });

    if (scrapedData.length === 0) {
      return res.json({
        response: "Sorry, I do not have enough information about this site yet.",
      });
    }

    const prompt = `
      The user has asked: "${query}". 
      We have the following content about this site:
      ${scrapedData.map((data, index) => `Content from page ${index + 1}: "${data.content}" Source URL: ${data.url}`).join('\n\n')}
      Please analyze the query and provide a helpful response based on the content.
    `;

    const aiResult = await model.generateContent(prompt);

    res.json({
      response: aiResult.response.text() || "I couldn't generate a response.",
      content: scrapedData.map((data) => data.content),
      urls: scrapedData.map((data) => data.url),
    });
  } catch (error) {
    console.error('Error during query processing:', error.message);
    res.status(500).json({ error: 'Query failed', details: error.message });
  }
});


// Start the server
app.listen(port, async () => {
  try {
    await prisma.$connect();
    console.log("Connected to the database");
    console.log(`Server running on port ${port}`);
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
});
