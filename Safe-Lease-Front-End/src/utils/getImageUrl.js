export const getImageUrl = (path) => {
  if (!path) return null;

  // External / preset images
  if (path.startsWith("http")) return path;

  // Ensure leading slash
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `http://localhost:4000${cleanPath}`;
};
