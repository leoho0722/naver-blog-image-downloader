import { apiPost } from "./client";
import type { JobStatusResponse, PackageResponse } from "./types";

const ENDPOINT = "/api/photos";

export async function submitJob(blogUrl: string): Promise<string> {
  const data = await apiPost<{ job_id: string }>(ENDPOINT, {
    action: "download",
    blog_url: blogUrl,
  });
  return data.job_id;
}

export async function checkJobStatus(
  jobId: string,
): Promise<JobStatusResponse> {
  return apiPost<JobStatusResponse>(ENDPOINT, {
    action: "status",
    job_id: jobId,
  });
}

export async function requestPackage(
  jobId: string,
  indices?: number[],
): Promise<PackageResponse> {
  const body: Record<string, unknown> = {
    action: "package",
    job_id: jobId,
  };
  if (indices !== undefined) {
    body.indices = indices;
  }
  return apiPost<PackageResponse>(ENDPOINT, body);
}

export async function checkPackageStatus(
  packageId: string,
): Promise<PackageResponse> {
  return apiPost<PackageResponse>(ENDPOINT, {
    action: "package_status",
    package_id: packageId,
  });
}
