import { v4 as uuidv4 } from "uuid";

// Types
interface Job {
  id: string;
  tokenId: string;
  address: string;
  imagePath: string;
  status: "processing" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
  animationUrl?: string;
  metadataUrl?: string;
  transactionHash?: string;
  error?: string;
}

// In-memory storage for jobs (in production, use a database)
const jobs = new Map<string, Job>();

// Create a new job
const createJob = (jobId: string, jobData: Partial<Job>): Job => {
  const job: Job = {
    id: jobId,
    tokenId: jobData.tokenId || "",
    address: jobData.address || "",
    imagePath: jobData.imagePath || "",
    status: jobData.status || "processing",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  jobs.set(jobId, job);
  return job;
};

// Get a job by ID
const getJob = (jobId: string): Job | undefined => {
  return jobs.get(jobId);
};

// Update a job
const updateJob = (jobId: string, updates: Partial<Job>): Job | undefined => {
  const job = jobs.get(jobId);

  if (!job) {
    return undefined;
  }

  const updatedJob = {
    ...job,
    ...updates,
    updatedAt: new Date(),
  };

  jobs.set(jobId, updatedJob);
  return updatedJob;
};

// List all jobs for an address
const getJobsByAddress = (address: string): Job[] => {
  return Array.from(jobs.values())
    .filter((job) => job.address.toLowerCase() === address.toLowerCase())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// Clean up old jobs (for memory management)
const cleanupOldJobs = (olderThanDays: number = 7): void => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  for (const [jobId, job] of jobs.entries()) {
    if (job.createdAt < cutoffDate) {
      jobs.delete(jobId);
    }
  }
};

export default {
  createJob,
  getJob,
  updateJob,
  getJobsByAddress,
  cleanupOldJobs,
};

// File: src/types/index.ts

// File: src/config/index.ts

// File: .env.example
