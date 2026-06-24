# Shopify Shipping & Regional Price Estimator App

A fully working regional pricing and shipping price estimator app built for Shopify storefronts. The project includes a Node.js/Express backend server, a Shopify Online Store 2.0 Theme App Extension, and a high-fidelity local storefront simulator for direct local testing.

---

## 🏗️ Architecture Design & API Integration

The application bridges the Shopify Storefront and our custom Node.js Express backend using **Shopify App Proxies**. Below is the architectural flow showing how the storefront calls the backend API securely, without CORS issues, and with cryptographic verification.

```
+-----------------------------------------------------------------------------------+
|                              1. CLIENT BROWSER                                    |
|                                                                                   |
|  [ Shopify Product Page ]  =====>  [ ZIP Estimator Block ]  =====>  User clicks   |
|  (Renders product liquid)         (shipping_estimator.liquid)       "Check Price" |
+-----------------------------------------------------------------------------------+
                                             |
                                             | sends GET request to
                                             | "/apps/shipping-estimator?zip=...&productId=..."
                                             v
+-----------------------------------------------------------------------------------+
|                              2. SHOPIFY PLATFORM                                  |
|                                                                                   |
|  * Intercepts the request at "/apps/shipping-estimator"                           |
|  * Appends Shopify signature parameters (HMAC verification parameters)            |
|  * Proxies full query string to configured backend API                            |
+-----------------------------------------------------------------------------------+
                                             |
                                             | forwards GET request with query params
                                             v
+-----------------------------------------------------------------------------------+
|                              3. APP BACKEND SERVER                                |
|                                                                                   |
|  [ Express.js Server (server.js) ]                                                |
|  * Validates HMAC signature against app secret key (production-ready)             |
|  * Checks ZIP code against Rules Engine (e.g. 75028 -> $1,499)                    |
|  * Returns JSON payload: { success: true, price: "$1,499", location: "..." }      |
+-----------------------------------------------------------------------------------+
                                             |
                                             | returns JSON response
                                             v
+-----------------------------------------------------------------------------------+
|                              4. CLIENT UPDATE DISPLAY                             |
|                                                                                   |
|  * Storefront script receives the pricing payload                                  |
|  * Dispatches CustomEvent "shopifyPriceEstimatorUpdate"                            |
|  * Storefront client.js listens, updates main price element, and animates display  |
+-----------------------------------------------------------------------------------+
```

### Key Integration Mechanics & Security

1. **Secure CORS-Free Calling (App Proxy)**: 
   Standard browsers block direct API calls from a Shopify merchant storefront (e.g., `shop.myshopify.com`) to an external app backend server (e.g., `api.myapp.com`) due to CORS. To resolve this, the extension script fetches from a relative subpath: `/apps/shipping-estimator`. Shopify handles the proxying internally, eliminating CORS configurations and keeping the backend URL hidden.
2. **Cryptographic Validation (HMAC Verification)**:
   By using `GET` requests, all user parameters (`zip`, `productId`, `variantId`) are passed in the URL query string. When Shopify proxies the request, it appends default parameters (e.g. `shop`, `path_prefix`, `timestamp`, `signature`) and signs the entire sorted query string using the app's Shared Secret. The backend server verifies this signature using a constant-time comparison to ensure the request genuinely came via Shopify and that none of the query parameters have been modified or tampered with.
3. **Liquid Shopify Context**: 
   The theme extension utilizes Liquid template variables to automatically capture product properties:
   * `{{ product.id }}`: Unique product ID.
   * `{{ product.selected_or_first_available_variant.id }}`: Active variant ID.
4. **Local Simulator Bypass**: 
   To support running the code locally without registering an active Shopify Partner account or tunnels, the frontend sets a `Shopify.isSimulator = true` flag. The script detects this flag and calls our relative Express route `/api/estimate-shipping` directly. If the backend does not have `SHOPIFY_API_SECRET` or `SHOPIFY_APP_SECRET` defined in the environment, it bypasses signature verification for easy testing.


---

## 📁 Project Structure

```
├── extensions/
│   └── shipping-estimator/
│       ├── shopify.extension.toml    # Theme extension registration config
│       └── blocks/
│           └── shipping_estimator.liquid # Liquid, CSS, and JS block component
├── public/
│   ├── assets/
│   │   └── product.png               # Skeleton Watch generated mockup image
│   ├── client.js                     # Interactive simulator state & event manager
│   ├── index.html                    # Luxury simulated product page
│   └── style.css                     # Premium dark theme and animation rules
├── .gitignore                        # Git ignore file for dependencies
├── package.json                      # Node project scripts & dependencies
├── server.js                         # Node Express backend API & static server
└── shopify.app.toml                  # App scopes, URLs, and App Proxy definition
```

---

## 🚀 How to Run Locally

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+ recommended) and Git installed on your system.

### 2. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/Srivardhan710/Shopify.git
cd Shopify
npm install
```

### 3. Start the Server
Launch the local Express server:
```bash
npm start
```

### 4. Test in Browser
Open your browser and navigate to:
**[http://localhost:3000/](http://localhost:3000/)**

---

## 🧪 Pricing Rules Engine Data

Enter the following ZIP codes in the estimator widget to test the rules engine:

| ZIP Code | Estimated Regional Price | Simulated Shipping Location |
| :--- | :--- | :--- |
| **75028** | `$1,499` | Flower Mound, TX (Southern Region) |
| **10001** | `$1,699` | New York, NY (Eastern Region) |
| **90210** | `$1,799` | Beverly Hills, CA (Western Region) |
| *Any other* | `$1,550` (Flat Rate) | Standard Flat Rate regional pricing |

---

## 📦 Active Production Deployment

The application is deployed and configured under your Shopify Partner Account:

- **Shopify Development Store Frontpage**: [https://regional-pricing-estimator.myshopify.com](https://regional-pricing-estimator.myshopify.com)
- **Shopify Store Admin**: [https://admin.shopify.com/store/regional-pricing-estimator](https://admin.shopify.com/store/regional-pricing-estimator)
- **Shopify Partner App Page**: [https://partners.shopify.com/223764241/apps/388564320257](https://partners.shopify.com/223764241/apps/388564320257)
- **Deployed App Version (v3)**: [Regional Pricing Estimator Version 3](https://dev.shopify.com/dashboard/223764241/apps/388564320257/versions/1026323283969)
- **Local Storefront Simulator**: [http://localhost:3000/](http://localhost:3000/)

---

## 🛠️ How to View and Edit the Theme Extension
1. Open the [Shopify Theme Customizer](https://admin.shopify.com/store/regional-pricing-estimator/themes).
2. Click **Customize** on your active theme.
3. In the top page selector, navigate to **Products** -> **Default product**.
4. In the left panel, click the arrow next to **Product information** to expand the blocks.
5. Click **Add block**, switch to the **Apps** tab, and select **Regional Pricing Estimator Block**.
6. Place the block on the page and click **Save** in the top-right corner.

