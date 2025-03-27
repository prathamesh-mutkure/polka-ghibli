import express from "express";
import jobService from "../services/jobService";

const router = express.Router();

// Get jobs for an address
router.get("/jobs/:address", (req, res) => {
  const { address } = req.params;

  if (!address) {
    return res.status(400).json({ error: "Address is required" });
  }

  const jobs = jobService.getJobsByAddress(address);

  res.json({
    success: true,
    jobs: jobs.map((job) => ({
      id: job.id,
      tokenId: job.tokenId,
      status: job.status,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      ...(job.status === "completed"
        ? {
            animationUrl: job.animationUrl,
            transactionHash: job.transactionHash,
          }
        : {}),
      ...(job.status === "failed" ? { error: job.error } : {}),
    })),
  });
});

export default router;
