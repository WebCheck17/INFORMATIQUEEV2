// src/utils/avatar.ts
export function getDefaultAvatar(gender?: string, name?: string): string {
  // Kalo ada gender explicit
  if (gender === "male") return "/images/users/default-1.png";
  if (gender === "female") return "/images/users/default-2.png";
  
  // Auto detect dari nama (opsional)
  const femaleNames = ["sarah", "amanda", "gita", "lestari", "dewi", "putri", "ani"];
  const isFemale = femaleNames.some(n => name?.toLowerCase().includes(n));
  
  return isFemale ? "/images/users/default-2.png" : "/images/users/default-1.png";
}