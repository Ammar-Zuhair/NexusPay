/**
 * api.js — Centralized API base URL resolver & defensive response parser
 */

const getApiBaseUrl = () => {
  let envUrl = import.meta.env.VITE_API_URL || '/api/v1';
  envUrl = envUrl.trim();

  // If user entered e.g. "api.nexuspaystore.com/api/v1" without http/https protocol
  if (envUrl && !envUrl.startsWith('http://') && !envUrl.startsWith('https://') && !envUrl.startsWith('/')) {
    envUrl = `https://${envUrl}`;
  }

  // Ensure no trailing slash
  return envUrl.replace(/\/+$/, '');
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Safely parses HTTP response text as JSON without crashing on empty bodies or HTML error pages.
 */
export const parseJsonResponse = async (res) => {
  const text = await res.text();
  if (!text || !text.trim()) {
    if (!res.ok) {
      throw new Error(`خطأ في استجابة الخادم (${res.status})`);
    }
    return {};
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    if (text.trim().startsWith('<')) {
      throw new Error(`تعذر الاتصال بـ API السيرفر (الرابط: ${API_BASE_URL}). الخادم أعاد صفحة HTML (رمز: ${res.status}). يرجى التأكد من تشغيل السيرفر وضبط إعدادات CORS والدومين.`);
    }
    throw new Error(`استجابة غير صالحة من السيرفر: ${text.slice(0, 80)}`);
  }
};
