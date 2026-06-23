// Shopify Storefront Simulator State & Interactions

document.addEventListener('DOMContentLoaded', () => {
  // 1. REACTIVE STOREFRONT STATE
  const state = {
    productTitle: "Chronos Nebula Automatic Watch",
    productId: "prod_nebula_99",
    basePrice: 1550,          // Calculated base price (Standard: 1550, ZIP-specific: 1499, 1699, 1799)
    activeZip: null,          // Destination ZIP if checked
    activeLocation: "Standard Rate", // Location display name
    activeCasing: "Titanium Black", // Active casing variant
    casingOffset: 0,          // Offset: Titanium Black (0), Brushed Rose Gold (+100)
    activeStrap: "Hybrid FKM Rubber", // Active strap variant
    strapOffset: 0,           // Offset: Hybrid FKM (+0), Saffiano Leather (+50)
    quantity: 1,
    cart: []                  // Cart array of items
  };

  // 2. DOM ELEMENT SELECTORS
  const displayPriceAmt = document.getElementById('product-display-price');
  const priceBadge = document.getElementById('product-price-badge');
  const locationIndicator = document.getElementById('location-indicator');
  const locationZip = document.getElementById('location-zip');
  const locationRegion = document.getElementById('location-region');
  
  const varTitaniumBtn = document.getElementById('var-titanium');
  const varGoldBtn = document.getElementById('var-gold');
  const mainProductImg = document.getElementById('main-product-img');
  const addToCartBtn = document.getElementById('add-to-cart-btn');
  const buyNowBtn = document.querySelector('.buy-now-btn');

  // Second group of option buttons (Strap variants)
  const strapBtns = document.querySelectorAll('.product-variants .variant-group:nth-child(2) .option-btn');

  // Search Elements
  const searchToggleBtn = document.querySelector('.header-actions .icon-btn[aria-label="Search"]');
  const searchOverlay = document.getElementById('search-overlay');
  const searchCloseBtn = document.getElementById('search-close-btn');
  const searchCloseBackdrop = document.getElementById('search-close-backdrop');
  const searchInput = document.getElementById('search-input');
  const searchResultsPanel = document.getElementById('search-results-panel');

  // Cart Elements
  const cartToggleBtn = document.querySelector('.header-actions .icon-btn[aria-label="Cart"]');
  const cartDrawerContainer = document.getElementById('cart-drawer-container');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartCloseBackdrop = document.getElementById('cart-close-backdrop');
  const cartDrawerBody = document.getElementById('cart-drawer-body');
  const cartDrawerFooter = document.getElementById('cart-drawer-footer');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const cartRegionalRow = document.getElementById('cart-regional-row');
  const cartRegionalBadge = document.getElementById('cart-regional-badge');
  const cartClearBtn = document.getElementById('cart-clear-btn');
  const cartCheckoutBtn = document.getElementById('cart-checkout-btn');
  const cartCountBadge = document.querySelector('.cart-count');

  // Checkout Elements
  const checkoutModalContainer = document.getElementById('checkout-modal-container');
  const checkoutCloseBtn = document.getElementById('checkout-close-btn');
  const checkoutCloseBackdrop = document.getElementById('checkout-close-backdrop');
  const checkoutForm = document.getElementById('checkout-form');
  const paySubmitBtn = document.getElementById('pay-submit-btn');

  const checkoutContentStep1 = document.getElementById('checkout-content-step1');
  const checkoutContentProcessing = document.getElementById('checkout-content-processing');
  const checkoutContentSuccess = document.getElementById('checkout-content-success');
  const checkoutProgressFill = document.getElementById('checkout-progress-fill');
  
  const processingStatusTitle = document.getElementById('processing-status-title');
  const processingStatusDesc = document.getElementById('processing-status-desc');

  // Order Summary Fields
  const summaryProductPrice = document.getElementById('summary-product-price');
  const summaryVariants = document.getElementById('summary-variants');
  const summaryZip = document.getElementById('summary-zip');
  const summaryDeliveryType = document.getElementById('summary-delivery-type');
  const summaryTotalPrice = document.getElementById('summary-total-price');

  // Receipt Fields
  const receiptOrderId = document.getElementById('receipt-order-id');
  const receiptTotal = document.getElementById('receipt-total');
  const receiptZip = document.getElementById('receipt-zip');
  const receiptRegion = document.getElementById('receipt-region');
  const receiptDoneBtn = document.getElementById('receipt-done-btn');

  // Navigation Links & Info Modal
  const navLinks = document.querySelectorAll('.nav-link, .logo');
  const infoModalContainer = document.getElementById('info-modal-container');
  const infoCloseBtn = document.getElementById('info-close-btn');
  const infoCloseBackdrop = document.getElementById('info-close-backdrop');
  const infoModalContent = document.getElementById('info-modal-content');


  // 3. REACTIVE UI RENDERING SYSTEM
  
  // Calculate final single product price based on base price and variant offsets
  function getFinalSinglePrice() {
    return state.basePrice + state.casingOffset + state.strapOffset;
  }

  // Update prices shown on the product page
  function renderPrice() {
    if (!displayPriceAmt) return;

    const finalPrice = getFinalSinglePrice();
    
    // Add micro-animation pulse
    displayPriceAmt.classList.remove('price-pulse');
    void displayPriceAmt.offsetWidth; // Force layout recalculation
    displayPriceAmt.classList.add('price-pulse');

    displayPriceAmt.innerText = finalPrice.toLocaleString();

    // Update main product page badge
    if (priceBadge) {
      priceBadge.innerText = state.activeLocation === 'Standard Rate' ? 'Standard Rate' : 'Special Regional Price';
      if (state.activeLocation !== 'Standard Rate') {
        priceBadge.style.background = 'rgba(16, 185, 129, 0.12)';
        priceBadge.style.color = '#10b981';
        priceBadge.style.borderColor = 'rgba(16, 185, 129, 0.2)';
      } else {
        priceBadge.style.background = 'rgba(255, 255, 255, 0.05)';
        priceBadge.style.color = 'var(--text-secondary)';
        priceBadge.style.borderColor = 'rgba(255, 255, 255, 0.1)';
      }
    }

    // Update location banner near price
    if (locationIndicator && locationZip && locationRegion) {
      if (state.activeZip) {
        locationIndicator.style.display = 'flex';
        locationZip.innerText = state.activeZip;
        locationRegion.innerText = state.activeLocation;
      } else {
        locationIndicator.style.display = 'none';
      }
    }
  }


  // 4. WATCH GALLERY INTERACTIONS (THUMBNAIL VIEWS)
  const thumbnails = document.querySelectorAll('.thumbnail');
  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', () => {
      // Toggle active states
      thumbnails.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');

      // Grab view transform type
      const viewType = thumb.getAttribute('data-view');

      // Clear all active transforms and apply new one
      if (mainProductImg) {
        mainProductImg.className = 'product-image'; // Reset classes
        mainProductImg.classList.add(`view-${viewType}`);
      }
    });
  });


  // 5. VARIANT SELECTOR CONTROLS
  
  // Casing Variants
  if (varTitaniumBtn && varGoldBtn) {
    varTitaniumBtn.addEventListener('click', () => {
      state.activeCasing = "Titanium Black";
      state.casingOffset = 0;
      varTitaniumBtn.classList.add('active');
      varGoldBtn.classList.remove('active');
      
      // Reset watch visual filter to normal titanium black
      if (mainProductImg) mainProductImg.style.filter = 'none';
      
      syncShopifyAnalytics();
      renderPrice();
    });

    varGoldBtn.addEventListener('click', () => {
      state.activeCasing = "Brushed Rose Gold";
      state.casingOffset = 100; // Adds $100 for rose gold
      varGoldBtn.classList.add('active');
      varTitaniumBtn.classList.remove('active');
      
      // Add sepia/warm gold filter to simulate Brushed Rose Gold casing
      if (mainProductImg) mainProductImg.style.filter = 'sepia(0.2) hue-rotate(330deg) brightness(1.04) contrast(1.02)';
      
      syncShopifyAnalytics();
      renderPrice();
    });
  }

  // Strap Variants
  if (strapBtns.length >= 2) {
    strapBtns.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        // Toggle classes
        strapBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (index === 0) {
          state.activeStrap = "Hybrid FKM Rubber";
          state.strapOffset = 0;
        } else {
          state.activeStrap = "Saffiano Leather";
          state.strapOffset = 50; // Adds $50 for premium leather
        }

        renderPrice();
      });
    });
  }


  // 6. ESTIMATOR CUSTOM EVENT SYNC (FROM ESTIMATOR LIQUID)
  // Listen for the price update event dispatched by the Theme App Extension liquid block script
  document.addEventListener('shopifyPriceEstimatorUpdate', (event) => {
    const { price, zip, location } = event.detail;
    
    // Parse response price into number
    const parsedPrice = parseInt(price.replace('$', '').replace(',', ''));
    
    // Update local state with ZIP data
    state.activeZip = zip;
    state.activeLocation = location;
    state.basePrice = parsedPrice;

    renderPrice();
  });


  // 7. CART DRAWER OPERATIONS
  
  // Update Cart Header Badge count
  function updateCartBadge() {
    if (!cartCountBadge) return;
    const totalItems = state.cart.reduce((sum, item) => sum + item.qty, 0);
    cartCountBadge.innerText = totalItems;
    cartCountBadge.style.display = totalItems > 0 ? 'flex' : 'none';
  }

  // Render Cart drawer list dynamically
  function renderCart() {
    if (!cartDrawerBody) return;

    if (state.cart.length === 0) {
      cartDrawerBody.innerHTML = '<p class="cart-empty-message">Your cart is currently empty.</p>';
      if (cartDrawerFooter) cartDrawerFooter.style.display = 'none';
      updateCartBadge();
      return;
    }

    let html = '';
    let subtotal = 0;

    state.cart.forEach((item, index) => {
      const itemPrice = item.price + item.casingOffset + item.strapOffset;
      const totalItemPrice = itemPrice * item.qty;
      subtotal += totalItemPrice;

      // Casing visual filter for thumbnail
      const thumbStyle = item.casing === 'Brushed Rose Gold' ? 'style="filter: sepia(0.2) hue-rotate(330deg) brightness(1.05)"' : '';

      html += `
        <div class="cart-item-row" data-index="${index}">
          <div class="cart-item-img">
            <img src="${item.image}" alt="${item.name}" ${thumbStyle}>
          </div>
          <div class="cart-item-info">
            <div>
              <div class="cart-item-title">${item.name}</div>
              <div class="cart-item-details">Casing: ${item.casing} | Strap: ${item.strap}</div>
            </div>
            <div class="cart-item-qty-row">
              <div class="qty-selectors">
                <button class="qty-btn dec-qty">-</button>
                <span class="qty-val">${item.qty}</span>
                <button class="qty-btn inc-qty">+</button>
              </div>
              <div class="cart-item-price">$${totalItemPrice.toLocaleString()}</div>
            </div>
          </div>
        </div>
      `;
    });

    cartDrawerBody.innerHTML = html;
    
    // Bind quantity increment/decrement listeners
    cartDrawerBody.querySelectorAll('.dec-qty').forEach((btn, index) => {
      btn.addEventListener('click', () => changeCartItemQty(index, -1));
    });
    cartDrawerBody.querySelectorAll('.inc-qty').forEach((btn, index) => {
      btn.addEventListener('click', () => changeCartItemQty(index, 1));
    });

    // Update Totals
    if (cartDrawerFooter) {
      cartDrawerFooter.style.display = 'block';
      cartSubtotal.innerText = `$${subtotal.toLocaleString()}`;

      // Show/hide regional pricing row in cart
      if (state.activeZip) {
        cartRegionalRow.style.display = 'flex';
        cartRegionalBadge.innerText = `${state.activeLocation} Checked`;
      } else {
        cartRegionalRow.style.display = 'none';
      }
    }

    updateCartBadge();
  }

  function changeCartItemQty(index, delta) {
    state.cart[index].qty += delta;
    if (state.cart[index].qty <= 0) {
      state.cart.splice(index, 1);
    }
    renderCart();
  }

  // Toggle Cart Drawer
  function toggleCartDrawer(open) {
    if (open) {
      renderCart();
      cartDrawerContainer.classList.add('active');
    } else {
      cartDrawerContainer.classList.remove('active');
    }
  }

  if (cartToggleBtn) cartToggleBtn.addEventListener('click', () => toggleCartDrawer(true));
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', () => toggleCartDrawer(false));
  if (cartCloseBackdrop) cartCloseBackdrop.addEventListener('click', () => toggleCartDrawer(false));

  if (cartClearBtn) {
    cartClearBtn.addEventListener('click', () => {
      state.cart = [];
      renderCart();
    });
  }

  // Add to Cart click handler
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const finalPrice = getFinalSinglePrice();
      
      // Build cart item configuration
      const cartItem = {
        id: state.productId,
        name: state.productTitle,
        price: state.basePrice, // store base price separate from offsets for variant changes
        casingOffset: state.casingOffset,
        strapOffset: state.strapOffset,
        qty: 1,
        casing: state.activeCasing,
        strap: state.activeStrap,
        image: "assets/product.png"
      };

      // Check if exact item variants are already in cart
      const existingItemIndex = state.cart.findIndex(item => 
        item.id === cartItem.id && 
        item.casing === cartItem.casing && 
        item.strap === cartItem.strap
      );

      if (existingItemIndex > -1) {
        state.cart[existingItemIndex].qty += 1;
      } else {
        state.cart.push(cartItem);
      }

      // Open Cart Drawer
      toggleCartDrawer(true);

      // Micro animation on add to cart button
      addToCartBtn.innerText = 'Added to Cart!';
      addToCartBtn.style.borderColor = '#10b981';
      addToCartBtn.style.color = '#10b981';
      setTimeout(() => {
        addToCartBtn.innerText = 'Add to Cart';
        addToCartBtn.style.borderColor = '#ffffff';
        addToCartBtn.style.color = '#ffffff';
      }, 1500);
    });
  }


  // 8. CHECKOUT PROCESS SIMULATION
  
  function openCheckout() {
    if (state.cart.length === 0) {
      // If buy now was clicked and cart is empty, add current configured item
      const cartItem = {
        id: state.productId,
        name: state.productTitle,
        price: state.basePrice,
        casingOffset: state.casingOffset,
        strapOffset: state.strapOffset,
        qty: 1,
        casing: state.activeCasing,
        strap: state.activeStrap,
        image: "assets/product.png"
      };
      state.cart.push(cartItem);
    }

    // Compile order subtotal
    let subtotal = 0;
    let descLines = [];
    state.cart.forEach(item => {
      const singlePrice = item.price + item.casingOffset + item.strapOffset;
      subtotal += singlePrice * item.qty;
      descLines.push(`${item.qty}x ${item.casing} / ${item.strap}`);
    });

    // Populate order summary DOM
    summaryProductPrice.innerText = `$${subtotal.toLocaleString()}`;
    summaryVariants.innerText = descLines.join(' | ');
    summaryZip.innerText = state.activeZip || "None checked (Standard Flat Rate)";
    summaryDeliveryType.innerText = state.activeZip ? "Expedited Regional Delivery" : "Complimentary Insured Shipping";
    summaryTotalPrice.innerText = `$${subtotal.toLocaleString()}`;

    // Reset steps visibility
    checkoutContentStep1.style.display = 'block';
    checkoutContentProcessing.style.display = 'none';
    checkoutContentSuccess.style.display = 'none';
    checkoutProgressFill.style.style = 'width: 0%';

    // Open checkout modal
    checkoutModalContainer.classList.add('active');
    toggleCartDrawer(false); // Close cart drawer
  }

  function closeCheckout() {
    checkoutModalContainer.classList.remove('active');
  }

  if (buyNowBtn) buyNowBtn.addEventListener('click', openCheckout);
  if (cartCheckoutBtn) cartCheckoutBtn.addEventListener('click', openCheckout);
  
  if (checkoutCloseBtn) checkoutCloseBtn.addEventListener('click', closeCheckout);
  if (checkoutCloseBackdrop) checkoutCloseBackdrop.addEventListener('click', closeCheckout);

  // Checkout Form Submission (Simulates Multi-Step banking verification progress bar)
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Show processing page
      checkoutContentStep1.style.display = 'none';
      checkoutContentProcessing.style.display = 'block';

      let progress = 0;
      checkoutProgressFill.style.width = '0%';
      processingStatusTitle.innerText = "Initiating Checkout";
      processingStatusDesc.innerText = "Securing private banking socket...";

      const interval = setInterval(() => {
        progress += 5;
        checkoutProgressFill.style.width = `${progress}%`;

        // Update step status labels
        if (progress === 20) {
          processingStatusTitle.innerText = "Verifying Credentials";
          processingStatusDesc.innerText = "Confirming card authorization with host network...";
        } else if (progress === 45) {
          processingStatusTitle.innerText = "Applying Regional Pricing";
          processingStatusDesc.innerText = state.activeZip 
            ? `Applying verified ZIP ${state.activeZip} special rate rules...` 
            : "No ZIP checked. Applying flat-rate standard pricing...";
        } else if (progress === 70) {
          processingStatusTitle.innerText = "Registering Dispatch Order";
          processingStatusDesc.innerText = "Configuring freight route logistics...";
        } else if (progress === 95) {
          processingStatusTitle.innerText = "Finalizing Order Receipt";
          processingStatusDesc.innerText = "Generating encrypted transaction order ID...";
        }

        if (progress >= 100) {
          clearInterval(interval);
          completeCheckoutSuccess();
        }
      }, 150);
    });
  }

  function completeCheckoutSuccess() {
    checkoutContentProcessing.style.display = 'none';
    checkoutContentSuccess.style.display = 'block';

    // Calculate totals paid
    let totalPaid = 0;
    state.cart.forEach(item => {
      const price = item.price + item.casingOffset + item.strapOffset;
      totalPaid += price * item.qty;
    });

    // Populate receipt details
    const randomOrderId = `#CH-${Math.floor(10000 + Math.random() * 90000)}`;
    receiptOrderId.innerText = randomOrderId;
    receiptTotal.innerText = `$${totalPaid.toLocaleString()}`;
    receiptZip.innerText = state.activeZip || "N/A";
    receiptRegion.innerText = state.activeLocation || "Standard Delivery";

    // Trigger success confetti or animations log
    console.log(`Checkout Complete: Order ${randomOrderId} processed successfully for total ${totalPaid}!`);
  }

  if (receiptDoneBtn) {
    receiptDoneBtn.addEventListener('click', () => {
      // Clear Cart
      state.cart = [];
      renderCart();
      closeCheckout();
    });
  }


  // 9. FULL-SCREEN SEARCH OVERLAY SIMULATOR
  
  const simulatedProductDatabase = [
    { name: "Chronos Nebula Automatic Watch", price: "$1,550", variant: "Titanium Casing / Skeleton Dial" },
    { name: "Chronos Helios Rose Gold Chrono", price: "$1,850", variant: "18k Rose Gold / Double Complication" },
    { name: "Chronos Selene Lunar Automatic", price: "$2,100", variant: "Stellar Gray Casing / Moonphase Display" },
    { name: "Chronos Aurora Carbon Chronograph", price: "$1,720", variant: "Carbon Fibre Casing / Neon Accents" }
  ];

  function toggleSearchOverlay(open) {
    if (open) {
      searchOverlay.classList.add('active');
      setTimeout(() => searchInput.focus(), 150);
    } else {
      searchOverlay.classList.remove('active');
      searchInput.value = '';
      searchResultsPanel.innerHTML = '<p class="search-empty">Start typing to search our collections...</p>';
    }
  }

  if (searchToggleBtn) searchToggleBtn.addEventListener('click', () => toggleSearchOverlay(true));
  if (searchCloseBtn) searchCloseBtn.addEventListener('click', () => toggleSearchOverlay(false));
  if (searchCloseBackdrop) searchCloseBackdrop.addEventListener('click', () => toggleSearchOverlay(false));

  // Close overlays on ESC keypress
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggleSearchOverlay(false);
      toggleCartDrawer(false);
      closeCheckout();
      infoModalContainer.classList.remove('active');
    }
  });

  // Search Results Simulation Filter
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value.toLowerCase().trim();

      if (!val) {
        searchResultsPanel.innerHTML = '<p class="search-empty">Start typing to search our collections...</p>';
        return;
      }

      const filtered = simulatedProductDatabase.filter(item => 
        item.name.toLowerCase().includes(val) || 
        item.variant.toLowerCase().includes(val)
      );

      if (filtered.length === 0) {
        searchResultsPanel.innerHTML = `<p class="search-empty">No products found matching "${val}"</p>`;
        return;
      }

      let html = '';
      filtered.forEach(item => {
        html += `
          <div class="search-result-item">
            <div class="search-result-img">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 24px; color: var(--text-muted);">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="search-result-info">
              <h4>${item.name}</h4>
              <p>${item.variant}</p>
            </div>
            <div class="search-result-price">${item.price}</div>
          </div>
        `;
      });

      searchResultsPanel.innerHTML = html;

      // Bind simulated result navigation
      searchResultsPanel.querySelectorAll('.search-result-item').forEach((item, index) => {
        item.addEventListener('click', () => {
          const matchName = filtered[index].name;
          alert(`Simulated navigation to product page: "${matchName}"`);
          toggleSearchOverlay(false);
        });
      });
    });
  }


  // 10. NAVIGATION LINK MODALS
  
  const navModalContentData = {
    collections: `
      <h2>Collections</h2>
      <p>Explore our limited-run mechanical series, hand-assembled by chronometer certified master watchmakers in Glashütte.</p>
      <div class="collections-grid">
        <div class="col-card" id="col-nebula">
          <h4>Nebula Series</h4>
          <p>Exposed skeleton mechanics</p>
          <span>From $1,550</span>
        </div>
        <div class="col-card" id="col-helios">
          <h4>Helios Series</h4>
          <p>Rose gold chronograph</p>
          <span>From $1,850</span>
        </div>
        <div class="col-card" id="col-selene">
          <h4>Selene Series</h4>
          <p>Lunar moonphase</p>
          <span>From $2,100</span>
        </div>
        <div class="col-card" id="col-aurora">
          <h4>Aurora Series</h4>
          <p>Carbon tactical tachymeter</p>
          <span>From $1,720</span>
        </div>
      </div>
    `,
    story: `
      <h2>Our Story</h2>
      <p>Founded on the principles of mechanical purity, Chronos was established in 2018 with a single vision: to build automatic watches that bridge the gap between traditional horology and modern aesthetics.</p>
      <p>Every piece we design is built from medical-grade titanium and high-density sapphire crystal, containing precision mechanical heartbeats that require no batteries and last for generations.</p>
      <p>We reject mass production. We design slowly, build manually, and deliver directly to enthusiasts who value the art of mechanical timekeeping.</p>
    `,
    craftsmanship: `
      <h2>Craftsmanship</h2>
      <p>We believe that luxury lies in the unseen details. Each watch undergoes rigorous thermal calibration and 5-position adjustment cycles over 480 hours to ensure accuracy.</p>
      <ul>
        <li><strong>Caliber:</strong> Self-winding mechanical movement with 42-hour power reserve.</li>
        <li><strong>Casing:</strong> Solid Grade 5 dark titanium with bead-blasted anti-reflective finishes.</li>
        <li><strong>Movement Finish:</strong> Côtes de Genève stripes and hand-polished bevelled edges.</li>
        <li><strong>Luminescence:</strong> Multi-layer Super-LumiNova BGW9 on dials and hands for nighttime visibility.</li>
      </ul>
    `
  };

  function openInfoModal(key) {
    if (!navModalContentData[key]) return;
    infoModalContent.innerHTML = navModalContentData[key];
    infoModalContainer.classList.add('active');
    
    // Bind click events if collections cards are loaded
    if (key === 'collections') {
      document.querySelectorAll('.col-card').forEach(card => {
        card.addEventListener('click', () => {
          const colName = card.querySelector('h4').innerText;
          alert(`Simulated navigation to collection category: ${colName}`);
          infoModalContainer.classList.remove('active');
        });
      });
    }
  }

  // Bind Header Link Click Handlers
  if (navLinks.length >= 3) {
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const text = link.innerText.toLowerCase().trim();
        
        if (text.includes('collection')) {
          openInfoModal('collections');
        } else if (text.includes('story')) {
          openInfoModal('story');
        } else if (text.includes('craftsmanship')) {
          openInfoModal('craftsmanship');
        } else if (text.includes('chronos')) {
          // Logo click simulates reloading the page state
          state.basePrice = 1550;
          state.activeZip = null;
          state.activeLocation = "Standard Rate";
          state.activeCasing = "Titanium Black";
          state.casingOffset = 0;
          state.activeStrap = "Hybrid FKM Rubber";
          state.strapOffset = 0;
          state.cart = [];
          
          if (varTitaniumBtn) varTitaniumBtn.click();
          if (strapBtns.length > 0) strapBtns[0].click();
          
          // Reset zip form if it exists
          const zipInput = document.getElementById('estimator-zip-input');
          const resultPanel = document.getElementById('estimator-result-panel');
          if (zipInput) zipInput.value = '';
          if (resultPanel) resultPanel.style.display = 'none';

          renderPrice();
          renderCart();
          alert("Storefront state reset successfully!");
        }
      });
    });
  }

  if (infoCloseBtn) infoCloseBtn.addEventListener('click', () => infoModalContainer.classList.remove('active'));
  if (infoCloseBackdrop) infoCloseBackdrop.addEventListener('click', () => infoModalContainer.classList.remove('active'));


  // 11. ANALYTICS SYNC
  // Synchronizes simulated selected variant info with local Shopify object
  function syncShopifyAnalytics() {
    if (window.Shopify && window.Shopify.Analytics) {
      window.Shopify.Analytics.meta.selectedVariantId = state.activeCasing === 'Brushed Rose Gold' ? 'var_rose_gold_789' : 'var_titanium_456';
    }
  }

  // Initial pricing and analytics setup
  window.Shopify = {
    isSimulator: true,
    Analytics: {
      meta: {
        product: {
          id: state.productId
        },
        selectedVariantId: 'var_titanium_456'
      }
    }
  };

  renderPrice();
});
