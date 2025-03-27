export interface JobData {
  tokenId: string;
  address: string;
  imagePath: string;
  status: "processing" | "completed" | "failed";
  animationUrl?: string;
  metadataUrl?: string;
  transactionHash?: string;
  error?: string;
}
