const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

// Setup file upload using multer
const upload = multer({ dest: "uploads/" });

// Endpoint to upload the file and extract text
router.post("/upload", upload.single("file"), async (req, res) => {
  const filePath = path.join(__dirname, "../", req.file.path); // Correct the path for file cleanup
  const fileExtension = path.extname(req.file.originalname).toLowerCase();

  try {
    console.log("File received:", req.file);  // Debug: Log received file information

    let extractedText = "";
    let title = req.file.originalname; // The title can be set to the original file name

    // Extract text based on file type (PDF or DOCX)
    if (fileExtension === ".docx") {
      extractedText = await extractTextFromDocx(filePath);
    } else if (fileExtension === ".pdf") {
      extractedText = await extractTextFromPdf(filePath);
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // Create a new entry in ExtractedContent
    const extractedContent = await prisma.extractedContent.create({
      data: {
        content: extractedText,  // The extracted content from the file
        fileName: req.file.originalname,  // The original file name
        url: req.file.path,  // Path to the uploaded file
        title: title,  // Title of the file (you can modify this if needed)
      },
    });

    // Send the extracted text and saved data as a response
    res.json({ text: extractedText, extractedContent: extractedContent });
  } catch (err) {
    console.error("Error processing file:", err);  // Debug: Log the error
    res.status(500).json({ error: "Error processing file" });
  } finally {
    // Clean up the uploaded file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Ensure file is deleted after processing
    }
  }
});

// Function to extract text from DOCX
async function extractTextFromDocx(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const { value } = await mammoth.extractRawText({ buffer });
    return value;
  } catch (error) {
    console.error("Error extracting text from DOCX:", error);
    throw new Error("Failed to extract text from DOCX");
  }
}

// Function to extract text from PDF
async function extractTextFromPdf(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw new Error("Failed to extract text from PDF");
  }
}

module.exports = router;