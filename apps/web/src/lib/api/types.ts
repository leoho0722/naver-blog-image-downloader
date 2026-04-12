export interface PhotoEntity {
  id: string;
  url: string;
  filename: string;
  width?: number;
  height?: number;
}

export interface PhotoDownloadResponse {
  total_images: number;
  successful_downloads: number;
  failure_downloads: number;
  image_urls: string[];
  errors: string[];
  elapsed_time: number;
}

export type JobStatus = "processing" | "completed" | "failed";

export interface JobStatusResponse {
  job_id: string;
  status: JobStatus;
  result?: PhotoDownloadResponse;
}

export type PackageStatus = "processing" | "completed" | "failed";

export interface PackageResponse {
  package_id: string;
  status: PackageStatus;
  download_url?: string;
  file_count?: number;
  file_size?: number;
  error?: string;
}

export interface FetchResult {
  photos: PhotoEntity[];
  blogId: string;
  blogUrl: string;
  totalImages: number;
  failureDownloads: number;
}
