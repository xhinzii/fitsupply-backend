const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const usersFile = path.join(__dirname, "users.json");

function loadUsers() {
  return JSON.parse(fs.readFileSync(usersFile, "utf8"));
}

function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

const productsFile = path.join(__dirname, "products.json");

function loadProducts() {
  return JSON.parse(fs.readFileSync(productsFile, "utf8"));
}

function saveProducts(products) {
  fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
}

app.get("/", (req, res) => {
  res.send("FitSupply Backend läuft!");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Bitte E-Mail und Passwort eingeben."
    });
  }

  if (users.find(user => user.email === email)) {
    return res.json({
      success: false,
      message: "Dieses Konto existiert bereits. Bitte anmelden."
    });
  }

  const newUser = {
    email,
    password,
    orders: []
  };

  users.push(newUser);
  saveUsers(users);

  res.json({
    success: true,
    message: "Registrierung erfolgreich. 5% Neukundenrabatt wurde aktiviert.",
    user: newUser
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();

  const user = users.find(user => user.email === email && user.password === password);

  if (!user) {
    return res.json({ success: false, message: "Anmeldung fehlgeschlagen. Bitte Daten prüfen." });
  }

  res.json({
    success: true,
    message: "Anmeldung erfolgreich.",
    user
  });
});

app.post("/order", (req, res) => {
  const { email, order } = req.body;

  const users = loadUsers();
  const products = loadProducts();

  if (!order || !order.cartItems) {
    return res.json({
      success: false,
      message: "Bestelldaten unvollständig."
    });
  }

  for (const cartItem of order.cartItems) {
    const product = products.find(product => product.name === cartItem.name);

    if (!product) {
      return res.json({
        success: false,
        message: "Produkt nicht gefunden: " + cartItem.name
      });
    }

    const variant = product.variants.find(variant => variant.size === cartItem.size);

    if (!variant) {
      return res.json({
        success: false,
        message: "Produktgröße nicht gefunden: " + cartItem.size
      });
    }

    if (variant.stock < cartItem.quantity) {
      return res.json({
        success: false,
        message: "Nicht genug Lagerbestand für " + cartItem.name + " (" + cartItem.size + ")."
      });
    }
  }

  for (const cartItem of order.cartItems) {
    const product = products.find(product => product.name === cartItem.name);
    const variant = product.variants.find(variant => variant.size === cartItem.size);

    variant.stock -= cartItem.quantity;
    variant.totalStock = variant.stock;
  }

  const user = email ? users.find(user => user.email === email) : null;

  if (user) {
    user.orders.unshift(order);
    saveUsers(users);
  }

  saveProducts(products);

  res.json({
    success: true,
    message: "Bestellung gespeichert und Lagerbestand aktualisiert.",
    user: user,
    products: products
  });
});

app.get("/products", (req, res) => {
  const products = loadProducts();
  res.json(products);
});

app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});