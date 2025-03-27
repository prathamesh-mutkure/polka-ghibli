// File: src/index.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { ethers } from "ethers";
import axios from "axios";

// Load environment variables
dotenv.config();

// Import routes and services
import jobService from "./services/jobService";
import apiRoutes from "./routes/api";
import OpenAI from "openai";

// Constants
const PORT = process.env.PORT || 3001;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const CONTRACT_ABI = require("../artifacts/GhibliNFT.json").abi;
const PROVIDER_URL = process.env.PROVIDER_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb: multer.FileFilterCallback) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      cb(null, false); // Reject file without error
      return;
    }
    cb(null, true);
  },
});

// Initialize Ethereum provider and contract
let provider: ethers.JsonRpcProvider;
let wallet: ethers.Wallet;
let contract: ethers.Contract;

const initEthereum = async () => {
  try {
    provider = new ethers.JsonRpcProvider(PROVIDER_URL);
    wallet = new ethers.Wallet(PRIVATE_KEY as string, provider);
    contract = new ethers.Contract(
      CONTRACT_ADDRESS as string,
      CONTRACT_ABI,
      wallet
    );

    console.log("Ethereum connection initialized");
  } catch (error) {
    console.error("Failed to initialize Ethereum connection:", error);
  }
};

// Initialize services
initEthereum();

// API routes
app.use("/api", apiRoutes);

// Upload route
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No image uploaded" });
      return;
    }

    const tokenId = req.body.tokenId;
    const address = req.body.address;

    if (!tokenId || !address) {
      res.status(400).json({ error: "Missing tokenId or address" });
      return;
    }

    // Create job for processing
    const jobId = uuidv4();
    const filePath = req.file.path;

    jobService.createJob(jobId, {
      tokenId,
      address,
      imagePath: filePath,
      status: "processing",
    });

    // Start processing image in background
    processImage(jobId).catch((error) => {
      console.error(`Job ${jobId} failed:`, error);
      jobService.updateJob(jobId, { status: "failed", error: error.message });
    });

    res.json({
      success: true,
      jobId,
      message: "Image uploaded and processing started",
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Job status route
app.get("/api/job-status/:jobId", (req, res) => {
  const { jobId } = req.params;

  const job = jobService.getJob(jobId);

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json({
    id: jobId,
    status: job.status,
    createdAt: job.createdAt,
    ...(job.status === "completed" ? { animationUrl: job.animationUrl } : {}),
    ...(job.status === "failed" ? { error: job.error } : {}),
  });
});

// Process image to create Ghibli animation and mint NFT
async function processImage(jobId: string) {
  const job = jobService.getJob(jobId);

  if (!job) {
    throw new Error("Job not found");
  }

  try {
    // 1. Process the image with AI service to create Ghibli animation
    const animationUrl = await createGhibliAnimation(job.imagePath);

    // 2. Create metadata for the NFT
    const metadata = {
      name: `Ghibli Animation #${job.tokenId}`,
      description: "A unique Ghibli-style animated illustration",
      image: animationUrl,
      attributes: [
        {
          trait_type: "Style",
          value: "Ghibli Animation",
        },
        {
          trait_type: "Created",
          value: new Date().toISOString(),
        },
      ],
    };

    // 3. Upload metadata to IPFS
    const metadataUrl = await uploadToIPFS(metadata);

    // 4. Set the token URI in the NFT contract
    const tx = await contract.setTokenURI(job.tokenId, metadataUrl);
    await tx.wait();

    // 5. Update job status
    jobService.updateJob(jobId, {
      status: "completed",
      animationUrl: animationUrl,
      metadataUrl: metadataUrl,
      transactionHash: tx.hash,
    });

    console.log(`Job ${jobId} completed successfully`);
  } catch (error) {
    console.error(`Error processing job ${jobId}:`, error);
    jobService.updateJob(jobId, { status: "failed", error: String(error) });
    throw error;
  }
}

// Create Ghibli-style animation from image
async function _createGhibliAnimation(imagePath: string): Promise<string> {
  try {
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    // Here you would integrate with an AI service that specializes in creating
    // Ghibli-style animations from images. Some options include:
    // - Replicate.com with a specific model
    // - A custom service using models like Stable Diffusion with animation capabilities

    // For this example, we'll simulate the API call

    // Example API call to animation service:
    /*
    const response = await axios.post('https://api.animation-service.com/generate', {
      image: base64Image,
      style: 'ghibli',
      animation_type: 'gentle',
      duration: 3 // seconds
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.ANIMATION_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const animationUrl = response.data.animation_url;
    */

    // For demo purposes, we'll simulate a processing delay and return a mock URL
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Create a directory for processed animations if it doesn't exist
    const processedDir = path.join(__dirname, "../processed");
    if (!fs.existsSync(processedDir)) {
      fs.mkdirSync(processedDir, { recursive: true });
    }

    // Copy the original image to the processed directory (in a real app, this would be the animation)
    const fileName = path.basename(imagePath);
    const processedPath = path.join(processedDir, fileName);
    fs.copyFileSync(imagePath, processedPath);

    // Return the URL where the animation would be hosted
    // In a production app, this would be a URL to your CDN or IPFS
    const animationUrl = `${process.env.API_BASE_URL}/processed/${fileName}`;

    return animationUrl;
  } catch (error) {
    console.error("Animation creation error:", error);
    throw new Error(`Failed to create animation: ${error}`);
  }
}

// In the processImage function or service
async function createGhibliAnimation(imagePath: string): Promise<string> {
  try {
    // Create mask programmatically or use a pre-defined Ghibli-style mask
    const maskPath = path.join(__dirname, "../assets/ghibli_mask.png");

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const imageFile = fs.createReadStream(imagePath);

    // Call the OpenAI API
    // const response = await openai.images.edit({
    //   model: "dall-e-2",
    //   image: await fs.promises.readFile(imagePath),
    //   mask: await fs.promises.readFile(maskPath),
    //   prompt:
    //     "Transform this image into a Studio Ghibli style animation with gentle wind effects, soft pastel colors, and detailed background elements in the style of Miyazaki",
    //   n: 1,
    //   size: "1024x1024",
    // });

    const response = await openai.images.edit({
      model: "dall-e-2",
      prompt:
        "Transform this image into a Studio Ghibli style animation with gentle wind effects, soft pastel colors, and detailed background elements in the style of Miyazaki",
      image: imageFile,
    });

    const animationUrl = response.data[0].url;

    // Download the image to your server for storage
    const processedDir = path.join(__dirname, "../processed");
    if (!fs.existsSync(processedDir)) {
      fs.mkdirSync(processedDir, { recursive: true });
    }

    const fileName = `ghibli_${Date.now()}.png`;
    const processedPath = path.join(processedDir, fileName);

    // Download the image from the URL
    const imageResponse = await axios.get(animationUrl!, {
      responseType: "arraybuffer",
    });
    await fs.promises.writeFile(processedPath, Buffer.from(imageResponse.data));

    // Return the URL where the animation is stored
    const savedImageUrl = `${process.env.API_BASE_URL}/processed/${fileName}`;

    return savedImageUrl;
  } catch (error) {
    console.error("Animation creation error:", error);
    throw new Error(`Failed to create animation: ${error}`);
  }
}

// Upload metadata to IPFS
async function uploadToIPFS(metadata: any): Promise<string> {
  try {
    // In a real implementation, you would use a service like Pinata, NFT.Storage, or Infura
    // to upload the metadata to IPFS

    // Example with Pinata:
    /*
    const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', metadata, {
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': process.env.PINATA_API_KEY,
        'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY
      }
    });
    
    return `ipfs://${response.data.IpfsHash}`;
    */

    // For demo purposes, we'll store the metadata locally and return a mock URL
    const metadataDir = path.join(__dirname, "../metadata");
    if (!fs.existsSync(metadataDir)) {
      fs.mkdirSync(metadataDir, { recursive: true });
    }

    const metadataId = uuidv4();
    const metadataPath = path.join(metadataDir, `${metadataId}.json`);
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    // Return the URL where the metadata would be hosted
    const metadataUrl = `${process.env.API_BASE_URL}/metadata/${metadataId}.json`;

    return metadataUrl;
  } catch (error) {
    console.error("IPFS upload error:", error);
    throw new Error(`Failed to upload to IPFS: ${error}`);
  }
}

// Serve processed animations
app.use("/processed", express.static(path.join(__dirname, "../processed")));

// Serve metadata
app.use("/metadata", express.static(path.join(__dirname, "../metadata")));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
