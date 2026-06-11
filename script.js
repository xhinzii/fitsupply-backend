    /* INHALTSVERZEICHNIS
       01. Produktdaten................................Zeile 18
       02. Slogans für die Startseite..................Zeile 121
       03. Globale Daten und Local Storage.............Zeile 134
       04. DOM-Elemente................................Zeile 148
       05. Hilfsfunktionen.............................Zeile 201
       06. Lagerlogik..................................Zeile 222
       07. Produktanzeige und Produkt-Slider...........Zeile 251
       08. Warenkorb...................................Zeile 390
       09. Konto, Registrierung und Login..............Zeile 515
       10. Checkout und Bestellung.....................Zeile 560
       11. Navigation..................................Zeile 626
       12. Button-Effekte..............................Zeile 650
       13. Suchfunktion................................Zeile 688
       14. Eventlistener...............................Zeile 771
    */

    /* 01. PRODUKTDATEN
       Hier werden alle Produkte, Größen, Preise und Lagerwerte gepflegt.
    */

    let products = [];

     // 02. SLOGANS FÜR DIE STARTSEITE

    const slogans = [
      '🔥 Mehr Energie. Mehr Fokus. Mehr FitSupply.',
      '💪 Dein Training verdient besseren Geschmack.',
      '⚡ Fitness beginnt mit der richtigen Ernährung.',
      '🍓 Fruchtiger Geschmack trifft echte Performance.',
      '🏋️ Protein, das nicht nur wirkt - sondern süchtig macht.',
      '🚀 Gib deinem Körper Premium-Fuel mit FitSupply.',
      '🥤 Jeder Shake bringt dich deinem Ziel näher.'
    ];

    /*
        03. GLOBALE DATEN UND LOCALSTORAGE
        Hier werden Warenkorb, Benutzer und eingeloggter Benutzer gespeichert.
    */

    const users = JSON.parse(localStorage.getItem('fitsupplyUsers') || '[]');
    const cart = JSON.parse(localStorage.getItem('fitsupplyCart') || '[]');
    cart.forEach(item => { if (!item.quantity) item.quantity = 1; });
    let currentUser = JSON.parse(localStorage.getItem('fitsupplyCurrentUser') || 'null');
    let selectedProductIndex = 0;
    let selectedVariantIndex = 0;
    let productStartIndex = 0;
    const productsPerView = 2;

    /*
       04. DOM-ELEMENTE
       Hier werden alle HTML-Elemente geholt, die JavaScript steuert.
    */

    const productGrid = document.getElementById('productGrid');
    const prevProductsBtn = document.getElementById('prevProductsBtn');
    const nextProductsBtn = document.getElementById('nextProductsBtn');
    const carouselCounter = document.getElementById('carouselCounter');
    const viewerImage = document.getElementById('viewerImage');
    const viewerName = document.getElementById('viewerName');
    const viewerDescription = document.getElementById('viewerDescription');
    const variantSelect = document.getElementById('variantSelect');
    const viewerPrice = document.getElementById('viewerPrice');
    const addToCartBtn = document.getElementById('addToCartBtn');
    const stockInfo = document.getElementById('stockInfo');
    const quantityInput = document.getElementById('quantityInput');
    const decreaseQuantityBtn = document.getElementById('decreaseQuantityBtn');
    const increaseQuantityBtn = document.getElementById('increaseQuantityBtn');
    const cartList = document.getElementById('cartList');
    const emptyCartText = document.getElementById('emptyCartText');
    const subtotalEl = document.getElementById('subtotal');
    const taxEl = document.getElementById('tax');
    const discountEl = document.getElementById('discount');
    const shippingEl = document.getElementById('shipping');
    const shippingInfoEl = document.getElementById('shippingInfo');
    const discountInfoEl = document.getElementById('discountInfo');
    const totalEl = document.getElementById('total');
    const payBtn = document.getElementById('payBtn');
    const checkoutBox = document.getElementById('checkoutBox');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const checkoutStatus = document.getElementById('checkoutStatus');
    const checkoutFirstName = document.getElementById('checkoutFirstName');
    const checkoutLastName = document.getElementById('checkoutLastName');
    const checkoutEmail = document.getElementById('checkoutEmail');
    const checkoutStreet = document.getElementById('checkoutStreet');
    const checkoutZip = document.getElementById('checkoutZip');
    const checkoutCity = document.getElementById('checkoutCity');
    const paymentMethod = document.getElementById('paymentMethod');
    const accountEmail = document.getElementById('accountEmail');
    const accountPassword = document.getElementById('accountPassword');
    const registerBtn = document.getElementById('registerBtn');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const accountMessage = document.getElementById('accountMessage');
    const welcomeText = document.getElementById('welcomeText');
    const orderList = document.getElementById('orderList');
    const emptyOrdersText = document.getElementById('emptyOrdersText');
    const randomSlogan = document.getElementById('randomSlogan');
    const logoHomeBtn = document.getElementById('logoHomeBtn');
    const productSearchInput = document.getElementById('productSearchInput');
    const productSearchBtn = document.getElementById('productSearchBtn');
    const searchResults = document.getElementById('searchResults');

     // 05. HILFSFUNKTIONEN

    function saveData() {
      localStorage.setItem('fitsupplyUsers', JSON.stringify(users));
      localStorage.setItem('fitsupplyCart', JSON.stringify(cart));
      localStorage.setItem('fitsupplyCurrentUser', JSON.stringify(currentUser));
    }

    function formatEuro(value) {
      return value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
    }

function loadProductsFromBackend() {
  fetch("http://localhost:3000/products")
    .then(response => response.json())
    .then(data => {
      products = data;

      selectedProductIndex = 0;
      selectedVariantIndex = 0;
      productStartIndex = 0;

      renderProducts();
      renderViewer();
      renderCart();
    })
    .catch(error => {
      console.error("Produkte konnten nicht geladen werden:", error);
      alert("Produkte konnten nicht vom Backend geladen werden.");
    });
}

    function getSelectedProduct() {
      return products[selectedProductIndex];
    }

    function getSelectedVariant() {
      return getSelectedProduct().variants[selectedVariantIndex];
    }

    /*
       06. LAGERLOGIK
       Gesamtbestand = 100 pro Produktgröße.
       Verfügbarer Bestand = 100 minus Warenkorbmenge.
    */

    function getCartQuantityForVariant(productName, size) {
      return cart
        .filter(item => item.name === productName && item.size === size)
        .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
    }

    function getAvailableStock(product, variant) {
  const totalStock = Number(variant.stock || 0);
  const reservedInCart = getCartQuantityForVariant(product.name, variant.size);
  return totalStock - reservedInCart;
}

    function getCartTotals() {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = subtotal * 0.19;
      const taxableAmount = subtotal + tax;
      const firstOrderDiscountEligible = currentUser && currentUser.orders.length === 0;
      const discount = firstOrderDiscountEligible ? taxableAmount * 0.05 : 0;
      const afterDiscount = taxableAmount - discount;
      const shipping = cart.length === 0 ? 0 : (afterDiscount >= 50 ? 0 : 4.99);
      const total = afterDiscount + shipping;
      return { subtotal, tax, discount, afterDiscount, shipping, total, firstOrderDiscountEligible };
    }

     // 07. PRODUKTANZEIGE UND PRODUKT-SLIDER

    function renderProducts() {
      productGrid.innerHTML = '';

      const visibleProducts = products.slice(productStartIndex, productStartIndex + productsPerView);

      visibleProducts.forEach((product, visibleIndex) => {
        const index = productStartIndex + visibleIndex;
        const minPrice = Math.min(...product.variants.map(v => v.price));
        const card = document.createElement('div');
        card.className = 'product-card' + (index === selectedProductIndex ? ' selected' : '');
        card.dataset.index = index;
        card.innerHTML = `
          <img class="product-thumb" src="${product.image}" alt="${product.name}" loading="lazy" decoding="async" onerror="this.style.opacity=0.25; this.alt='Bild nicht gefunden: ' + this.alt;">
          <h3>${product.name}</h3>
          <p><strong>ab ${formatEuro(minPrice)}</strong></p>
          <div class="product-info">
            ${product.tasteInfo}
            <div class="ingredients">${product.ingredients}</div>
          </div>
        `;
        card.addEventListener('click', () => selectProduct(index));
        productGrid.appendChild(card);
      });

      const firstNumber = productStartIndex + 1;
      const lastNumber = Math.min(productStartIndex + productsPerView, products.length);
      carouselCounter.textContent = firstNumber + '-' + lastNumber + ' von ' + products.length;

      prevProductsBtn.disabled = productStartIndex === 0;
      nextProductsBtn.disabled = productStartIndex + productsPerView >= products.length;
    }

    function selectProduct(index) {
      selectedProductIndex = index;
      selectedVariantIndex = 0;
  
    renderProducts();
      renderViewer();
    }

    function renderViewer() {
      const product = getSelectedProduct();
      const variant = getSelectedVariant();
      const availableStock = getAvailableStock(product, variant);

      viewerImage.style.opacity = '1';
      viewerImage.src = product.image;
      viewerImage.alt = product.name;
      viewerName.textContent = product.name;
      viewerDescription.textContent = product.description;

      variantSelect.innerHTML = '';
      product.variants.forEach((item, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = item.size + ' - ' + formatEuro(item.price) + ' | Lager: ' + getAvailableStock(product, item);
        variantSelect.appendChild(option);
      });

      variantSelect.value = String(selectedVariantIndex);
      viewerPrice.textContent = 'Preis pro Stück: ' + formatEuro(variant.price);

      quantityInput.max = availableStock;
      quantityInput.value = Math.min(Math.max(Number(quantityInput.value) || 1, 1), Math.max(availableStock, 1));

      if (availableStock <= 0) {
        stockInfo.className = 'stock-info stock-empty';
        stockInfo.textContent = 'Ausverkauft - aktuell nicht verfügbar.';
        addToCartBtn.disabled = true;
        quantityInput.disabled = true;
      } else if (availableStock <= 20) {
        stockInfo.className = 'stock-info stock-low';
        stockInfo.textContent = '⚠ Nur noch ' + availableStock + ' Stück verfügbar.';
        addToCartBtn.disabled = false;
        quantityInput.disabled = false;
      } else {
        stockInfo.className = 'stock-info stock-good';
        stockInfo.textContent = '✅ ' + availableStock + ' Stück auf Lager.';
        addToCartBtn.disabled = false;
        quantityInput.disabled = false;
      }
    }


    function getProductVariantByCartItem(cartItem) {
      const product = products.find(item => item.name === cartItem.name);
      if (!product) return null;

      const variant = product.variants.find(item => item.size === cartItem.size);
      if (!variant) return null;

      return { product, variant };
    }

    function updateCartQuantity(index, newQuantity) {
      const item = cart[index];
      if (!item) return;

      const found = getProductVariantByCartItem(item);
      if (!found) return;

      const variant = found.variant;
      const quantity = Number(newQuantity);
      const totalStock = Number(variant.stock || 0);

      if (!Number.isInteger(quantity) || quantity < 1) {
        alert('Bitte gib eine gültige Menge ein.');
        renderCart();
        return;
      }

      if (quantity > totalStock) {
        alert('Von dieser Produktgröße gibt es insgesamt nur ' + totalStock + ' Stück.');
        renderCart();
        return;
      }

      item.quantity = quantity;

      saveData();
      renderProducts();
      renderViewer();
      renderCart();
    }

    function removeCartItem(index) {
      const item = cart[index];
      if (!item) return;

      cart.splice(index, 1);
      saveData();
      renderProducts();
      renderViewer();
      renderCart();
    }

    /*
       08. WARENKORB
       Mengen können erhöht, verringert oder direkt eingetippt werden.
    */

    function renderCart() {
      cartList.innerHTML = '';
      emptyCartText.style.display = cart.length === 0 ? 'block' : 'none';

      cart.forEach((item, index) => {
        const row = document.createElement('li');
        row.className = 'cart-item';
        row.innerHTML = `
          <div class="cart-item-left">
            <div class="cart-item-title">${item.name} (${item.size})</div>
            <span class="muted">Einzelpreis: ${formatEuro(item.price)}</span>
            <span class="muted">Summe: ${formatEuro(item.price * item.quantity)}</span>
          </div>

          <div class="cart-item-right">
            <div class="cart-quantity-control">
              <button class="cart-qty-btn cart-minus" type="button">−</button>
              <input class="cart-qty-input" type="number" min="1" value="${item.quantity}">
              <button class="cart-qty-btn cart-plus" type="button">+</button>
            </div>
            <button class="remove-btn" type="button">Entfernen ✕</button>
          </div>
        `;

        row.querySelector('.cart-minus').addEventListener('click', () => {
          updateCartQuantity(index, item.quantity - 1);
        });

        row.querySelector('.cart-plus').addEventListener('click', () => {
          updateCartQuantity(index, item.quantity + 1);
        });

        const cartQtyInput = row.querySelector('.cart-qty-input');

        cartQtyInput.addEventListener('input', () => {
          /*
            Nicht direkt korrigieren, damit auch 20, 41 usw. eingetippt werden können.
          */
        });

        cartQtyInput.addEventListener('change', event => {
          updateCartQuantity(index, Number(event.target.value));
        });

        cartQtyInput.addEventListener('blur', event => {
          updateCartQuantity(index, Number(event.target.value));
        });

        row.querySelector('.remove-btn').addEventListener('click', () => {
          removeCartItem(index);
        });
        cartList.appendChild(row);
      });

      const totals = getCartTotals();
      subtotalEl.textContent = formatEuro(totals.subtotal);
      taxEl.textContent = formatEuro(totals.tax);
      discountEl.textContent = totals.discount > 0 ? '- ' + formatEuro(totals.discount) : formatEuro(0);
      shippingEl.textContent = totals.shipping === 0 && cart.length > 0 ? 'Gratis' : formatEuro(totals.shipping);
      totalEl.textContent = formatEuro(totals.total);
      payBtn.disabled = cart.length === 0;
      placeOrderBtn.disabled = cart.length === 0;

      if (cart.length === 0) {
        checkoutBox.style.display = 'none';
        shippingInfoEl.textContent = 'Ab 50,00 € Bestellwert inklusive Mehrwertsteuer ist der Versand gratis.';
      } else if (totals.afterDiscount >= 50) {
        shippingInfoEl.textContent = 'Versand gratis ab 50,00 € inklusive Mehrwertsteuer - du hast den kostenlosen Versand erreicht.';
      } else {
        shippingInfoEl.textContent = 'Noch ' + formatEuro(50 - totals.afterDiscount) + ' bis zum gratis Versand ab 50,00 € inklusive Mehrwertsteuer.';
      }

      discountInfoEl.textContent = totals.firstOrderDiscountEligible
        ? 'Neukundenrabatt aktiv: 5% auf deine erste Bestellung.'
        : currentUser
          ? 'Kein Neukundenrabatt mehr verfügbar.'
          : 'Melde dich an oder registriere dich für 5% Rabatt auf deine erste Bestellung.';

      checkoutStatus.textContent = currentUser
        ? 'Angemeldet als ' + currentUser.email + '. Deine Bestellung wird im Konto gespeichert.'
        : 'Gastbestellung möglich. Für Bestellübersicht bitte anmelden oder registrieren.';
    }

    function renderOrders() {
      orderList.innerHTML = '';
      if (!currentUser) {
        welcomeText.textContent = 'Noch nicht angemeldet.';
        emptyOrdersText.style.display = 'block';
        logoutBtn.style.display = 'none';
        return;
      }

      welcomeText.textContent = 'Angemeldet als ' + currentUser.email;
      logoutBtn.style.display = 'inline-block';
      emptyOrdersText.style.display = currentUser.orders.length === 0 ? 'block' : 'none';

      currentUser.orders.forEach((order, index) => {
        const row = document.createElement('li');
        row.className = 'order-item';
        row.innerHTML = `
          <div>
            <strong>${order.number || 'Bestellung ' + (index + 1)}</strong><br>
            <span class="muted">${order.items.join(', ')}</span>
          </div>
          <div>
            ${formatEuro(order.total)}<br>
            <span class="muted">${order.payment || 'Demo-Zahlung'}</span>
          </div>
        `;
        orderList.appendChild(row);
      });
    }

    function updateStoredCurrentUser() {
      if (!currentUser) return;
      const index = users.findIndex(user => user.email === currentUser.email);
      if (index !== -1) users[index] = currentUser;
      saveData();
    }

    /*
       09. KONTO, REGISTRIERUNG UND LOGIN
    */

    function registerUser() {
  const email = accountEmail.value.trim().toLowerCase();
  const password = accountPassword.value.trim();

  fetch("http://localhost:3000/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  .then(response => response.json())
  .then(data => {
    accountMessage.textContent = data.message;

    if (data.success) {
      currentUser = data.user;
      saveData();
      renderOrders();
      renderCart();
    }
  })
  .catch(() => {
    accountMessage.textContent = "Backend nicht erreichbar.";
  });
}

    function loginUser() {
  const email = accountEmail.value.trim().toLowerCase();
  const password = accountPassword.value.trim();

  fetch("http://localhost:3000/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  })
  .then(response => response.json())
  .then(data => {
    accountMessage.textContent = data.message;

    if (data.success) {
      currentUser = data.user;
      saveData();
      renderOrders();
      renderCart();
    }
  })
  .catch(() => {
    accountMessage.textContent = "Backend nicht erreichbar.";
  });
}

    function logoutUser() {
      currentUser = null;
      saveData();
      accountMessage.textContent = 'Du wurdest abgemeldet.';
      renderOrders();
      renderCart();
    }

     // 10. CHECKOUT UND BESTELLUNG

    function openCheckout() {
      if (cart.length === 0) {
        alert('Dein Warenkorb ist noch leer.');
        return;
      }
      checkoutBox.style.display = 'block';
      if (currentUser && !checkoutEmail.value) checkoutEmail.value = currentUser.email;
      checkoutStatus.textContent = currentUser
        ? 'Angemeldet als ' + currentUser.email + '. Deine Bestellung wird im Konto gespeichert.'
        : 'Du bestellst als Gast. Du kannst trotzdem normal bezahlen.';
      checkoutBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function validateCheckout() {
      const fields = [
        { el: checkoutFirstName, name: 'Vorname' },
        { el: checkoutLastName, name: 'Nachname' },
        { el: checkoutEmail, name: 'E-Mail' },
        { el: checkoutStreet, name: 'Straße und Hausnummer' },
        { el: checkoutZip, name: 'PLZ' },
        { el: checkoutCity, name: 'Stadt' }
      ];
      for (const field of fields) {
        if (!field.el.value.trim()) {
          checkoutStatus.textContent = 'Bitte ausfüllen: ' + field.name;
          field.el.focus();
          return false;
        }
      }
      return true;
    }

    function completePayment() {
  if (cart.length === 0) {
    alert('Dein Warenkorb ist noch leer.');
    return;
  }

  if (!validateCheckout()) return;

  const totals = getCartTotals();
  const orderNumber = 'FS-' + Math.floor(100000 + Math.random() * 900000);

  const order = {
    number: orderNumber,
    customer: checkoutFirstName.value.trim() + ' ' + checkoutLastName.value.trim(),
    email: checkoutEmail.value.trim(),
    address: checkoutStreet.value.trim() + ', ' + checkoutZip.value.trim() + ' ' + checkoutCity.value.trim(),
    payment: paymentMethod.value,
    items: cart.map(item => item.quantity + 'x ' + item.name + ' (' + item.size + ')'),
    cartItems: cart.map(item => ({
      name: item.name,
      size: item.size,
      quantity: item.quantity
    })),
    total: totals.total
  };

  fetch("http://localhost:3000/order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: currentUser ? currentUser.email : null,
      order: order
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      if (data.user) {
      currentUser = data.user;
    }
      products = data.products;

      cart.length = 0;

      saveData();
      renderProducts();
      renderViewer();
      renderOrders();
      renderCart();

      checkoutBox.style.display = 'block';
      checkoutStatus.textContent = 'Bestellung ' + orderNumber + ' erfolgreich! Zahlungsart: ' + order.payment + '. Eine Demo-Bestätigung wurde an ' + order.email + ' erstellt.';
    } else {
      checkoutStatus.textContent = data.message;
    }
  })
  .catch(() => {
    checkoutStatus.textContent = "Backend nicht erreichbar. Bestellung konnte nicht gespeichert werden.";
  });
}

     // 11. NAVIGATION

    function showPanel(panelId) {
      document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));

      document.getElementById(panelId)?.classList.add('active');

      const navButton = document.querySelector('[data-panel="' + panelId + '"]');

      if (navButton?.classList.contains('nav-btn')) {
        navButton.classList.add('active');
      }

      if (panelId === 'home') {
        randomSlogan.textContent = slogans[Math.floor(Math.random() * slogans.length)];
      }

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }

     // 12. BUTTON-EFFEKTE

    function addRipple(event) {
      const button = event.currentTarget;
      if (!button.getBoundingClientRect) return;
      if (button.classList.contains('search-submit')) return;
      if (!button.matches('.nav-btn, .add-btn, .pay-btn, .auth-btn, .ghost-btn, .qty-btn, .cart-qty-btn')) return;

      const circle = document.createElement('span');
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;
      const rect = button.getBoundingClientRect();
      circle.style.width = circle.style.height = diameter + 'px';
      circle.style.left = event.clientX - rect.left - radius + 'px';
      circle.style.top = event.clientY - rect.top - radius + 'px';
      circle.classList.add('ripple');
      button.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    }

    function hapticFeedback() {
      if (navigator.vibrate) navigator.vibrate(35);
    }

    function premiumClick(button) {
      button.animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(0.96)' },
          { transform: 'scale(1.03)' },
          { transform: 'scale(1)' }
        ],
        { duration: 280, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
      );
    }


    /*
       13. SUCHFUNKTION
       Sucht nach Produkten, die mit dem eingegebenen Text anfangen.
    */

    function normalizeSearchText(value) {
      return value.toLowerCase().trim();
    }

    function productMatchesSearchStart(product, query) {
      const search = normalizeSearchText(query);
      if (!search) return false;

      return product.name.toLowerCase().startsWith(search);
    }

    function findProductIndexBySearch(query) {
      const search = normalizeSearchText(query);
      if (!search) return -1;

      return products.findIndex(product => productMatchesSearchStart(product, search));
    }

    function openProductFromSearch(index) {
      if (index < 0 || index >= products.length) {
        alert('Kein passendes Produkt gefunden.');
        return;
      }

      productStartIndex = Math.floor(index / productsPerView) * productsPerView;
      selectedProductIndex = index;
      selectedVariantIndex = 0;

      showPanel('produkte');
      renderProducts();
      renderViewer();

      productSearchInput.value = products[index].name;
      searchResults.classList.remove('active');

      document.getElementById('produkte').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }

    function performProductSearch() {
      const index = findProductIndexBySearch(productSearchInput.value);
      openProductFromSearch(index);
    }

    function renderSearchResults() {
      const query = normalizeSearchText(productSearchInput.value);
      searchResults.innerHTML = '';

      if (!query) {
        searchResults.classList.remove('active');
        return;
      }

      const matches = products
        .map((product, index) => ({ product, index }))
        .filter(({ product }) => productMatchesSearchStart(product, query))
        .slice(0, 6);

      if (matches.length === 0) {
        searchResults.innerHTML = '<div class="search-no-result">Kein Produkt mit diesem Anfang gefunden</div>';
        searchResults.classList.add('active');
        return;
      }

      matches.forEach(({ product, index }) => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.textContent = product.name;
        item.addEventListener('click', () => openProductFromSearch(index));
        searchResults.appendChild(item);
      });

      searchResults.classList.add('active');
    }


    /*
       14. EVENTLISTENER
       Hier werden Klicks, Suche, Warenkorb und Navigation verbunden.
    */

    document.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', addRipple);
      button.addEventListener('click', () => {
        hapticFeedback();

        if (!button.classList.contains('search-submit')) {
          premiumClick(button);
        }
      });
    });

    document.querySelectorAll('[data-panel]').forEach(button => {
      button.addEventListener('click', () => showPanel(button.dataset.panel));
    });


    productSearchInput.addEventListener('input', renderSearchResults);

    productSearchInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        performProductSearch();
      }

      if (event.key === 'Escape') {
        searchResults.classList.remove('active');
      }
    });

    productSearchBtn.addEventListener('click', () => {
      productSearchBtn.classList.add('search-clicked');
      setTimeout(() => productSearchBtn.classList.remove('search-clicked'), 160);
      performProductSearch();
    });

    document.addEventListener('click', event => {
      if (!event.target.closest('.search-box')) {
        searchResults.classList.remove('active');
      }
    });

    logoHomeBtn.addEventListener('click', () => showPanel('home'));

    variantSelect.addEventListener('change', event => {
      selectedVariantIndex = Number(event.target.value);
      renderViewer();
    });


    function showStockWarning(product, variant) {
      const availableStock = getAvailableStock(product, variant);

      if (availableStock === 20) {
        alert('🔔 Nachbestellen: ' + product.name + ' (' + variant.size + ') hat nur noch 20 Stück auf Lager.');
      } else if (availableStock > 0 && availableStock < 20) {
        alert('⚠ Hinweis: Von ' + product.name + ' (' + variant.size + ') sind nur noch ' + availableStock + ' Stück verfügbar.');
      }
    }

    addToCartBtn.addEventListener('click', () => {
      const product = getSelectedProduct();
      const variant = getSelectedVariant();
      const availableStock = getAvailableStock(product, variant);
      const quantity = Number(quantityInput.value);

      if (!Number.isInteger(quantity) || quantity <= 0) {
        alert('Bitte gib eine gültige Anzahl ein.');
        quantityInput.value = 1;
        quantityInput.focus();
        return;
      }

      if (quantity > availableStock) {
        alert('Es sind nur noch ' + availableStock + ' Stück auf Lager.');
        quantityInput.value = Math.max(availableStock, 1);
        quantityInput.focus();
        return;
      }

      const existingCartItem = cart.find(item => item.name === product.name && item.size === variant.size);

      if (existingCartItem) {
        existingCartItem.quantity += quantity;
      } else {
        cart.push({
          name: product.name,
          size: variant.size,
          price: variant.price,
          quantity
        });
      }

      saveData();
      checkoutStatus.textContent = quantity + 'x ' + product.name + ' wurde in den Warenkorb gelegt.';

      const cartButton = document.querySelector('[data-panel="warenkorb"]');
      cartButton.classList.remove('cart-bump');
      void cartButton.offsetWidth;
      cartButton.classList.add('cart-bump');

      showStockWarning(product, variant);
      renderProducts();
      renderViewer();
      renderCart();
    });

    prevProductsBtn.addEventListener('click', () => {
      productStartIndex = Math.max(0, productStartIndex - productsPerView);
      selectedProductIndex = productStartIndex;
      selectedVariantIndex = 0;
  
    document.querySelectorAll('.qty-btn, .cart-qty-btn').forEach(button => {
      button.addEventListener('mouseenter', () => {
        button.style.boxShadow =
          '0 10px 0 #8e2745, 0 18px 28px rgba(255,107,138,0.28)';
      });

      button.addEventListener('mouseleave', () => {
        button.style.boxShadow =
          '0 5px 0 #8e2745, 0 10px 18px rgba(0,0,0,0.30)';
      });
    });

    renderProducts();
      renderViewer();
    });

    nextProductsBtn.addEventListener('click', () => {
      productStartIndex = Math.min(products.length - productsPerView, productStartIndex + productsPerView);
      selectedProductIndex = productStartIndex;
      selectedVariantIndex = 0;
  
    document.querySelectorAll('.qty-btn, .cart-qty-btn').forEach(button => {
      button.addEventListener('mouseenter', () => {
        button.style.boxShadow =
          '0 10px 0 #8e2745, 0 18px 28px rgba(255,107,138,0.28)';
      });

      button.addEventListener('mouseleave', () => {
        button.style.boxShadow =
          '0 5px 0 #8e2745, 0 10px 18px rgba(0,0,0,0.30)';
      });
    });

    renderProducts();
      renderViewer();
    });


    function setProductQuantity(value) {
      const product = getSelectedProduct();
      const variant = getSelectedVariant();
      const availableStock = getAvailableStock(product, variant);
      let quantity = Number(value);

      if (!Number.isInteger(quantity) || quantity < 1) quantity = 1;
      if (quantity > availableStock) quantity = availableStock;

      quantityInput.value = quantity;
    }

    function validateProductQuantityField() {
      if (quantityInput.value === '') return;

      const product = getSelectedProduct();
      const variant = getSelectedVariant();
      const availableStock = getAvailableStock(product, variant);
      const quantity = Number(quantityInput.value);

      if (!Number.isInteger(quantity) || quantity < 1) {
        quantityInput.value = 1;
        return;
      }

      if (quantity > availableStock) {
        alert('Es sind nur noch ' + availableStock + ' Stück auf Lager.');
        quantityInput.value = availableStock;
      }
    }

    quantityInput.addEventListener('input', () => {
      /*
        Wichtig:
        Hier wird NICHT sofort korrigiert.
        Dadurch kann man mehrstellige Zahlen wie 20 oder 41 sauber eintippen.
      */
    });

    quantityInput.addEventListener('change', validateProductQuantityField);
    quantityInput.addEventListener('blur', validateProductQuantityField);

    decreaseQuantityBtn.addEventListener('click', () => {
      setProductQuantity((Number(quantityInput.value) || 1) - 1);
    });

    increaseQuantityBtn.addEventListener('click', () => {
      setProductQuantity((Number(quantityInput.value) || 0) + 1);
    });

    payBtn.addEventListener('click', openCheckout);
    placeOrderBtn.addEventListener('click', completePayment);
    registerBtn.addEventListener('click', registerUser);
    loginBtn.addEventListener('click', loginUser);
    logoutBtn.addEventListener('click', logoutUser);

    randomSlogan.textContent = slogans[Math.floor(Math.random() * slogans.length)];

    document.querySelectorAll('.qty-btn, .cart-qty-btn').forEach(button => {
      button.addEventListener('mouseenter', () => {
        button.style.boxShadow =
          '0 10px 0 #8e2745, 0 18px 28px rgba(255,107,138,0.28)';
      });

      button.addEventListener('mouseleave', () => {
        button.style.boxShadow =
          '0 5px 0 #8e2745, 0 10px 18px rgba(0,0,0,0.30)';
      });
    });

    loadProductsFromBackend();
    renderOrders();
    renderCart();