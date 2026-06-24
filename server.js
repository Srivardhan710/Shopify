const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS so the storefront simulator can call the API locally
app.use(cors());
app.use(express.json());

// Serve static simulator files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Rules Engine Data (ZIP Code to Price map)
const pricingRules = {
  '75028': { price: '$1,499', location: 'Flower Mound, TX (Southern Region)' },
  '10001': { price: '$1,699', location: 'New York, NY (Eastern Region)' },
  '90210': { price: '$1,799', location: 'Beverly Hills, CA (Western Region)' }
};

// Helper to verify Shopify App Proxy HMAC signature
function verifyShopifySignature(query) {
  const secret = process.env.SHOPIFY_API_SECRET || process.env.SHOPIFY_APP_SECRET;
  const hasSecret = !!secret;

  if (!hasSecret) {
    console.warn('[Security Warning] Shopify API secret not set. Skipping signature verification (Simulator Mode).');
    return true;
  }

  const { signature, ...params } = query;
  if (!signature) {
    console.error('Signature verification failed: Missing signature parameter.');
    return false;
  }

  // Sort query parameters alphabetically by key
  const sortedKeys = Object.keys(params).sort();
  
  // Reconstruct message string: key1=value1key2=value2... (no delimiters)
  const message = sortedKeys.map(key => {
    const val = params[key];
    if (Array.isArray(val)) {
      return `${key}=${val.join(',')}`;
    }
    return `${key}=${val}`;
  }).join('');

  // Compute HMAC SHA256 signature using the app secret
  const computedSignature = crypto
    .createHmac('sha256', secret)
    .update(message, 'utf-8')
    .digest('hex');

  // Verify signature using timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch (err) {
    console.error('Signature verification failed: Comparison error.', err.message);
    return false;
  }
}

// API Endpoint: Estimate shipping/product price based on destination ZIP code
// Modified to use GET for app proxy security & signature validation compatibility
app.get('/api/estimate-shipping', (req, res) => {
  const { zip, productId, variantId } = req.query;

  console.log(`\n--- [Incoming Request] ---`);
  console.log(`Timestamp:  ${new Date().toISOString()}`);
  console.log(`Product ID: ${productId || 'N/A'}`);
  console.log(`Variant ID: ${variantId || 'N/A'}`);
  console.log(`ZIP Code:   "${zip}"`);

  const secret = process.env.SHOPIFY_API_SECRET || process.env.SHOPIFY_APP_SECRET;
  const hasSecret = !!secret;

  // Enforce Shopify signature verification in production/secure environments
  if (hasSecret && !verifyShopifySignature(req.query)) {
    console.log(`Response:   Error [Invalid or Missing Shopify Signature]`);
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or missing Shopify signature.' });
  }

  if (!zip) {
    console.log(`Response:   Error [Missing ZIP Code]`);
    return res.status(400).json({ error: 'ZIP code is required.' });
  }

  // Normalize ZIP code (trim spaces and force to string)
  const cleanZip = String(zip).trim();

  // Apply pricing rules
  if (pricingRules.hasOwnProperty(cleanZip)) {
    const rule = pricingRules[cleanZip];
    console.log(`Rules Match: ${cleanZip} -> ${rule.price} (${rule.location})`);
    return res.json({
      success: true,
      zip: cleanZip,
      price: rule.price,
      location: rule.location,
      message: 'Region-specific custom pricing applied.'
    });
  } else {
    // Default fallback price
    const defaultPrice = '$1,550';
    console.log(`Rules Match: No custom match. Fallback to standard price: ${defaultPrice}`);
    return res.json({
      success: true,
      zip: cleanZip,
      price: defaultPrice,
      location: 'Other Locations',
      message: 'Standard flat-rate regional pricing applied.'
    });
  }
});

// Direct route to the storefront simulator
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  Shopify Shipping Price Estimator Backend Active  `);
  console.log(`  Running locally on: http://localhost:${PORT}      `);
  console.log(`==================================================`);
});
