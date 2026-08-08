/**
 * api.js — Centralized API base URL resolver
 *
 * Logic:
 *  • In development (npm run dev):  VITE_API_URL = /api/v1  → proxied by Vite to localhost:5000
 *  • In production (nexuspaystore.com): VITE_API_URL = https://nexuspaystore.com/api/v1
 *
 * All files should import this instead of repeating the URL logic inline.
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
