import axios from "axios";

// Export utility
export function getReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min`;
}

// If you use an external backend *elsewhere*, keep baseURL, otherwise remove
const api = axios.create({
  withCredentials: true,
});

export default api;
