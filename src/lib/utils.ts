import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getImageUrl(path: string | undefined): string {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  
  const base = import.meta.env.BASE_URL || '/';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const cleanBase = base.endsWith('/') ? base : base + '/';
  
  return cleanBase + cleanPath;
}
