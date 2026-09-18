export function getApiBase(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "").replace(/\/$/, "");
  if (envUrl) return envUrl;
  return process.env.NODE_ENV === "development"
    ? "http://localhost:5000"
    : "https://online-shopping-backend-liart.vercel.app";
}

export default getApiBase;
