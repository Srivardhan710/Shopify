const express = require('express');
const cors = require('cors');
const path = require('path');

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

// API Endpoint: Estimate shipping/product price based on destination ZIP code
app.post('/api/estimate-shipping', (req, res) => {
  const { zip, productId, variantId } = req.body;

  console.log(`\n--- [Incoming Request] ---`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Product ID: ${productId || 'N/A'}`);
  console.log(`Variant ID: ${variantId || 'N/A'}`);
  console.log(`ZIP Code:   "${zip}"`);

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
