
const menuToggle = document.getElementById("menu-toggle");
const navbar = document.getElementById("navbar");

menuToggle.addEventListener("click", () => {
  navbar.classList.toggle("show");
});

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search");
  const categoryFilter = document.getElementById("category-filter");
  const sortSelect = document.getElementById("sort");
  const productList = document.getElementById("products");
  let products = Array.from(document.querySelectorAll(".product-card"));

  function filterAndSort() {
    let searchValue = searchInput.value.toLowerCase();
    let categoryValue = categoryFilter.value.toLowerCase();
    let sortValue = sortSelect.value;

    // Filter
    let filtered = products.filter(product => {
      let title = product.querySelector("h3").innerText.toLowerCase();
      let category = product.dataset.category.toLowerCase();
      return (
        (categoryValue === "all" || category === categoryValue) &&
        title.includes(searchValue)
      );
    });

    // Sort
    if (sortValue === "price-asc") {
      filtered.sort((a, b) => parseFloat(a.dataset.price) - parseFloat(b.dataset.price));
    } else if (sortValue === "price-desc") {
      filtered.sort((a, b) => parseFloat(b.dataset.price) - parseFloat(a.dataset.price));
    }

    // Render
    productList.innerHTML = "";
    filtered.forEach(product => productList.appendChild(product));
  }

  // Event Listeners
  searchInput.addEventListener("input", filterAndSort);
  categoryFilter.addEventListener("change", filterAndSort);
  sortSelect.addEventListener("change", filterAndSort);
});

/* ====== CATALOG (single source of truth) ====== */
const CATALOG = {
  "wireless-headphones": {
    name: "Wireless Headphones",
    price: "10500",
    image: "images/wireless-headphones.png",
    rating: 4.5,
    description: "High-fidelity wireless headphones with active noise isolation, plush ear cushions, and up to 30 hours of battery life—perfect for work, travel, and music."
  },
  "dyson-airwrap": {
    name: "Dyson Airwrap",
    price: "237000",
    image: "images/dyson-airwrap.png",
    rating: 4.8,
    description: "Premium multi-styler using Coanda airflow for curls, waves, smooth blow-drying, and volume—styling with less heat damage."
  },
  "mens-cotton-shirt": {
    name: "Men's Cotton T-Shirt",
    price: "2000",
    image: "images/men's-cotton-shirt.png",
    rating: 4.2,
    description: "Breathable, lightweight 100% cotton tee. Soft hand-feel, classic fit, and easy to pair for daily wear."
  },
  "nike-sneakers": {
    name: "Nike Sneakers",
    price: "23275",
    image: "images/nike-sneakers.png",
    rating: 4.7,
    description: "Everyday sneakers with responsive cushioning, durable outsole grip, and a versatile style that goes with everything."
  },
  "leather-laptop-bag": {
    name: "Leather Laptop Bag",
    price: "5300",
    image: "images/leather-laptop-bag2.png",
    rating: 4.5,
    description: "Premium leather messenger with padded 15\" laptop sleeve, organized compartments, and a comfortable shoulder strap."
  },
  "cloth-hanging-stand": {
    name: "Cloth Hanging Stand",
    price: "2699",
    image: "images/cloth-hanging-stand.png",
    rating: 4.1,
    description: "Sturdy, rust-resistant drying rack with adjustable rails—perfect for small spaces and quick laundry days."
  },
  "hp-envy": {
    name: "HP Envy x360",
    price: "250000",
    image: "images/hp.png",
    rating: 4.8,
    description: "Convertible 2-in-1 with 360° hinge, touchscreen, and fast performance—ideal for study, work, and creativity."
  },
  "electric-chopper": {
    name: "Electric Chopper",
    price: "12000",
    image: "images/electric-chopper1.png",
    rating: 4.4,
    description: "Compact, powerful food chopper for veggies, nuts, and meats. One-touch operation and easy clean bowl."
  },
  "water-bottle": {
    name: "Water Bottle for Kids",
    price: "1500",
    image: "images/water-bottle.png",
    rating: 4.0,
    description: "Leak-proof, lightweight bottle with a flip top and fun graphics—keeps kids hydrated on the go."
  },
  "apple-watch": {
    name: "Apple Watch",
    price: "7000",
    image: "images/apple-touch-watch.png",
    rating: 4.6,
    description: "Smartwatch for fitness tracking, notifications, and health insights—with customizable watch faces and bands."
  },
  "ultralight-eyeglasses": {
    name: "Ultralight Eyeglasses",
    price: "1000",
    image: "images/enacolor-ultralight-eyeglasses.png",
    rating: 4.1,
    description: "Featherlight frames with clear optics to reduce eye strain—comfortable for all-day wear."
  },
  "luxury-handbags": {
    name: "Luxury Handbags",
    price: "5500",
    image: "images/handbag.png",
    rating: 4.3,
    description: "Elegant handbags with premium finish and practical compartments—dress up your daily or party look."
  }
};

const Cart = (() => {
  const KEY = "cart";

  const readRaw = () => JSON.parse(localStorage.getItem(KEY) || "[]");
  const save = (cart) => localStorage.setItem(KEY, JSON.stringify(cart));

  const toNumber = (p) => {
    if (typeof p === "number") return p;
    const n = parseFloat(String(p).replace(/[^0-9.]/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const currency = (n) => "Rs. " + Number(n).toLocaleString();

  // Normalize older cart items (qty -> quantity) and coerce types.
  function normalize(cart) {
    let changed = false;
    cart = cart.map((item) => {
      // migrate `qty` -> `quantity`
      if (item.qty !== undefined && item.quantity === undefined) {
        item.quantity = Number(item.qty) || 0;
        delete item.qty;
        changed = true;
      } else {
        item.quantity = Number(item.quantity) || 0;
      }

      // ensure price is numeric
      item.price = toNumber(item.price);

      return item;
    });

    if (changed) save(cart);
    return cart;
  }

  function load() {
    return normalize(readRaw());
  }

  function add(id, quantity = 1) {
    const p = CATALOG && CATALOG[id];
    if (!p) return;
    const cart = load();
    const qty = Math.max(1, Number(quantity) || 1);
    const idx = cart.findIndex((i) => i.id === id);

    if (idx > -1) {
      cart[idx].quantity = (Number(cart[idx].quantity) || 0) + qty;
    } else {
      cart.push({
        id,
        name: p.name,
        image: p.image,
        price: toNumber(p.price),
        quantity: qty,
      });
    }

    save(cart);
    badge();
  }

  function badge() {
    const count = load().reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
    const el = document.querySelector("[data-cart-count]");
    if (el) el.textContent = String(count);
  }

  function getAll() {
    return load();
  }

  function updateAt(index, qty) {
    const cart = load();
    if (!cart[index]) return;
    cart[index].quantity = Math.max(1, Number(qty) || 1);
    save(cart);
    badge();
  }

  function removeAt(index) {
    const cart = load();
    if (!cart[index]) return;
    cart.splice(index, 1);
    save(cart);
    badge();
  }

  return { add, badge, currency, getAll, updateAt, removeAt };
})();

/* ====== HELPERS ====== */
const $ = (sel) => document.querySelector(sel);
function getParam(key) {
  const usp = new URLSearchParams(location.search);
  return usp.get(key);
}
function stars(rating) {
  const r = Math.round(rating || 0);
  return "★".repeat(r) + "☆".repeat(5 - r);
}

/* ====== SHOP PAGE WIRING ====== */
function initShopPage() {
  const grid = document.getElementById("products");
  if (!grid) return;

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".add-to-cart");
    if (!btn) return;
    e.preventDefault();
    const id = btn.getAttribute("data-id");
    if (!id || !CATALOG[id]) return;
    Cart.add(id, 1);
    
    alert(`🛒${CATALOG[id].name} has been added to cart`);
  });

  grid.addEventListener("click", (e) => {
    const viewBtn = e.target.closest(".view-details");
    if (!viewBtn) return;
    const id = viewBtn.getAttribute("data-id");
    if (id) location.href = `product.html?id=${encodeURIComponent(id)}`;
  });

  Cart.badge();
}

/* ====== PRODUCT DETAIL PAGE WIRING ====== */
function initProductPage() {
  const img = $("#product-image");
  const nameEl = $("#product-name");
  const ratingEl = $("#product-rating");
  const descEl = $("#product-description");
  const priceEl = $("#product-price");
  const qtyEl = $("#qty"); // ensure your product page uses id="qty"
  const addBtn = $("#add-to-cart-button"); // ensure your product page uses id="add-to-cart-button"

  if (!img || !nameEl || !addBtn) return;

  const id = getParam("id");
  const data = id ? CATALOG[id] : null;

  if (!data) {
    const holder = document.querySelector(".product-detail");
    if (holder) {
      holder.innerHTML = `
        <div style="padding:16px">
          <h2>Product not found</h2>
          <p>We couldn’t find that product. Please return to the <a href="shop.html">shop</a>.</p>
        </div>
      `;
    }
    return;
  }

  // Fill UI
  document.title = data.name + " | Product Detail";
  img.src = data.image;
  img.alt = data.name;
  nameEl.textContent = data.name;
  ratingEl.textContent = stars(data.rating);
  descEl.textContent = data.description;
  priceEl.textContent = "Rs. " + Number(data.price).toLocaleString("en-PK", { minimumFractionDigits: 2 });
  addBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const qty = Math.max(1, Number(qtyEl?.value) || 1);
    Cart.add(id, qty);
    alert(`${data.name} (x${qty}) added to cart`);
  });

  Cart.badge();
}

/* ====== CART PAGE (render + events) ====== */
function loadCart() {
  const cart = Cart.getAll();
  const cartTableBody = document.querySelector("#cartTable tbody");
  const totalAmount = document.getElementById("totalAmount");
  const cartCount = document.querySelector("[data-cart-count]");

  if (!cartTableBody) return; // not on cart page

  cartTableBody.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const q = Number(item.quantity) || 0;
    const lineTotal = item.price * q;
    total += lineTotal;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td><img src="${item.image}" alt="${item.name}" width="60"></td>
      <td>${item.name}</td>
      <td>
        <input type="number" value="${q}" min="1" data-index="${index}" class="qty-input">
      </td>
      <td>${Cart.currency(lineTotal)}</td>
      <td><button class="remove-btn" data-index="${index}">X</button></td>
    `;
    cartTableBody.appendChild(row);
  });

  if (totalAmount) totalAmount.textContent = `Total: ${Cart.currency(total)}`;
  if (cartCount) cartCount.textContent = cart.reduce((s, i) => s + (Number(i.quantity) || 0), 0);

  // events (attach after HTML built)
  cartTableBody.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = Number(e.target.dataset.index);
      Cart.removeAt(index);
      loadCart();
    });
  });

  cartTableBody.querySelectorAll(".qty-input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const index = Number(e.target.dataset.index);
      const val = Math.max(1, Number(e.target.value) || 1);
      Cart.updateAt(index, val);
      loadCart();
    });
  });
}

/* ====== INIT ====== */
document.addEventListener("DOMContentLoaded", () => {
  initShopPage();
  initProductPage();
  loadCart();
});
 
let cart = JSON.parse(localStorage.getItem("cart")) || [];

    function showSummary() {
  let total = 0;
  cart.forEach(item => {
    total += Number(item.price) * Number(item.quantity); // no replace needed
  });
  document.getElementById("orderSummary").innerText =
    "Order Total: Rs. " + total.toLocaleString("en-PK", { minimumFractionDigits: 2 });
}

    document.getElementById("checkoutForm").addEventListener("submit", function(e) {
      e.preventDefault();
      alert("Order placed successfully!");
      localStorage.removeItem("cart");
      window.location.href = "shop.html";
    });

    showSummary();


