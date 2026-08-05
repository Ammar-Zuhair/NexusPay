/**
 * reloadly.service.js - Service wrapper for Reloadly Gift Cards API
 * Handles OAuth2 client credentials token caching and API calls for digital codes, vouchers, and subscriptions.
 */

import dotenv from 'dotenv';
dotenv.config();

const CLIENT_ID = process.env.RELOADLY_CLIENT_ID;
const CLIENT_SECRET = process.env.RELOADLY_CLIENT_SECRET;
const AUDIENCE = process.env.RELOADLY_AUDIENCE || 'https://giftcards.reloadly.com';
const AUTH_URL = 'https://auth.reloadly.com/oauth/token';

let cachedToken = null;
let tokenExpiresAt = null;

/**
 * Gets a valid OAuth2 Access Token for Reloadly Gift Cards API
 */
export async function getAccessToken() {
  if (cachedToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
    return cachedToken;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('RELOADLY_CLIENT_ID or RELOADLY_CLIENT_SECRET is not configured in .env');
  }

  console.log('[RELOADLY SERVICE] Fetching fresh OAuth2 token for Gift Cards...');
  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'client_credentials',
      audience: AUDIENCE
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to authenticate with Reloadly: ${res.status} ${errText}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  const expiresInMs = (data.expires_in || 3600) * 1000;
  tokenExpiresAt = Date.now() + expiresInMs - 60000;

  console.log('[RELOADLY SERVICE] Token fetched successfully.');
  return cachedToken;
}

/**
 * Make an authorized request to Reloadly Gift Cards API
 */
async function reloadlyRequest(endpoint, options = {}) {
  const token = await getAccessToken();
  // Sandbox vs Production base url
  const baseUrl = AUDIENCE.includes('sandbox') 
    ? 'https://giftcards-sandbox.reloadly.com' 
    : 'https://giftcards.reloadly.com';
  
  const url = `${baseUrl}${endpoint}`;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/com.reloadly.giftcards-v1+json',
    'Content-Type': 'application/json',
    ...options.headers
  };

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: 'Unknown Reloadly Gift Card error' }));
    const error = new Error(errorBody.message || `Reloadly Gift Card API Error: ${response.status}`);
    error.statusCode = response.status;
    error.details = errorBody;
    throw error;
  }

  return response.json();
}

/**
 * Fetch all available gift card products (catalog)
 * @param {Object} params - Query params (page, size, countryCode, etc.)
 */
export async function getProducts(params = {}) {
  let queryStr = '';
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.append('page', params.page);
  if (params.size) searchParams.append('size', params.size);
  if (params.countryCode) searchParams.append('countryCode', params.countryCode.toUpperCase());
  if (params.productName) searchParams.append('productName', params.productName);

  if (searchParams.toString()) {
    queryStr = `?${searchParams.toString()}`;
  }
  return reloadlyRequest(`/products${queryStr}`);
}

/**
 * Fetch a specific gift card product by ID
 */
export async function getProductById(productId) {
  return reloadlyRequest(`/products/${productId}`);
}

/**
 * Order a digital gift card / activation code
 * @param {Object} payload
 * @param {number} payload.productId - Reloadly Product ID
 * @param {number} payload.quantity - Quantity (default 1)
 * @param {number} payload.unitPrice - Price per unit (matching Reloadly product pricing)
 * @param {string} payload.customIdentifier - Unique internal order reference ID
 * @param {string} payload.recipientEmail - Recipient email address
 */
export async function createGiftCardOrder({ productId, quantity = 1, unitPrice, customIdentifier, recipientEmail }) {
  const body = {
    productId: parseInt(productId, 10),
    quantity: parseInt(quantity, 10),
    unitPrice: parseFloat(unitPrice),
    customIdentifier: customIdentifier || `CW-GC-${Date.now()}`,
    senderName: 'CoinWestie',
    recipientEmail: recipientEmail || 'customer@coinwestie.com'
  };

  return reloadlyRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(body)
  });
}
