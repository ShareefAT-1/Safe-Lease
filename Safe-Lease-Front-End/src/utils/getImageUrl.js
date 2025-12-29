export const getImageUrl = (path) => {
  if (!path) return null;

  if (path.startsWith("http")) return path;

  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  return `http://localhost:4000${cleanPath}`;
};
