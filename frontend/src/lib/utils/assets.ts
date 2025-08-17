// Utility to get the correct asset URL based on the base path
export function getAssetUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In production, Vite sets import.meta.env.BASE_URL
  // In development, it's usually '/'
  const base = import.meta.env.BASE_URL || '/';
  
  // Ensure base ends with slash and path doesn't start with one
  return `${base}${cleanPath}`;
}