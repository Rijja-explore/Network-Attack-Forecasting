// Centralized API configuration for local dev and production deployment (Vercel / Render)
export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
