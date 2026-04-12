export async function blogId(blogUrl: string): Promise<string> {
  const data = new TextEncoder().encode(blogUrl);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex.substring(0, 16);
}
