const productsDiv = document.getElementById("products");
const cartItemsDiv = document.getElementById("cart-items");
const totalSpan = document.getElementById("total");
const buyBtn = document.getElementById("buyBtn");

let cart = [];

async function fetchProducts() {
  const res = await fetch("/api/getStock");
  const produits = await res.json();

  productsDiv.innerHTML = "";
  produits.forEach(p => {
    const btn = document.createElement("button");
    btn.textContent = `${p.nom} (${p.prixVente}€)`;
    btn.onclick = () => addToCart(p);
    productsDiv.appendChild(btn);
  });
}

function addToCart(product) {
  const existing = cart.find(i => i.name === product.nom);
  if (existing) {
    existing.quantite++;
  } else {
    cart.push({ name: product.nom, quantite: 1, prix: product.prixVente });
  }
  renderCart();
}

function renderCart() {
  cartItemsDiv.innerHTML = "";
  let total = 0;
  cart.forEach(item => {
    total += item.quantite * item.prix;
    const div = document.createElement("div");
    div.className = "cart-item";
    div.textContent = `${item.quantite}x ${item.name}`;
    cartItemsDiv.appendChild(div);
  });
  totalSpan.textContent = total;
}

buyBtn.onclick = async () => {
  if (cart.length === 0) return;
  const res = await fetch("/api/acheter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: cart })
  });
  if (res.ok) {
    alert("Purchase successful!");
    cart = [];
    renderCart();
    fetchProducts();
  } else {
    alert("Purchase failed!");
  }
};

fetchProducts();
