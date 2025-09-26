const productsDiv = document.getElementById("products");
const cartItemsDiv = document.getElementById("cart-items");
const totalSpan = document.getElementById("total");
const buyBtn = document.getElementById("buyBtn");
const historyBtn = document.getElementById("historyBtn");
const historyModal = document.getElementById("historyModal");
const historyContent = document.getElementById("historyContent");
const closeBtn = document.querySelector(".close-btn");
const categoryTabs = document.getElementById("category-tabs");

let cart = [];
let allProducts = []; // Store all products
let activeCategory = "all"; // Default active category

// Fonctions de formatage
function formatDate(isoString) {
  if (!isoString) return ""; 
  
  try {
    const date = new Date(isoString);
    
    if (isNaN(date.getTime())) {
      return isoString; // Return original string if parsing fails
    }
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    console.error("Error parsing date:", e);
    return isoString; 
  }
}
// Helper function to format prices (cents to euros)
function formatPrice(cents) {
  return (cents / 100).toFixed(2);
}

async function fetchProducts() {
  const res = await fetch("/api/getStock");
  allProducts = await res.json();
  
  generateCategoryTabs(allProducts);
  
  displayProductsByCategory(activeCategory);
}


function generateCategoryTabs(products) {
  const categories = ["all", ...new Set(products.map(p => p.category || "uncategorized"))];
  
  const allTab = categoryTabs.querySelector('[data-category="all"]');
  categoryTabs.innerHTML = '';
  categoryTabs.appendChild(allTab);
  
  // Create a tab for each category
  categories.forEach(category => {
    if (category === "all") return; // Skip "all" as we already have it
    
    const tabBtn = document.createElement("button");
    tabBtn.className = "tab-btn";
    tabBtn.dataset.category = category;
    tabBtn.textContent = category.charAt(0).toUpperCase() + category.slice(1);
    
    tabBtn.addEventListener("click", () => {
      activeCategory = category;
        document.querySelectorAll(".tab-btn").forEach(btn => {
          btn.classList.remove("active");
      });
      tabBtn.classList.add("active");
      
      displayProductsByCategory(category);
    });
    
    categoryTabs.appendChild(tabBtn);
  });
  
  // Set the "all" tab as active by default
  allTab.addEventListener("click", () => {
    activeCategory = "all";
    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.classList.remove("active");
    });
    allTab.classList.add("active");
    displayProductsByCategory("all");
  });
}

function displayProductsByCategory(category) {
  productsDiv.innerHTML = "";
  const filteredProducts = category === "all" 
    ? allProducts 
    : allProducts.filter(p => (p.category || "uncategorized") === category);
  filteredProducts.forEach(p => {
    // Create a product item div
    const productItem = document.createElement("div");
    productItem.className = "product-item";
    productItem.onclick = () => addToCart(p);
    
    // Create product name span
    const nameSpan = document.createElement("span");
    nameSpan.className = "product-name";
    nameSpan.textContent = p.nom;
    
    // Create product price span
    const priceSpan = document.createElement("span");
    priceSpan.className = "product-price";
    priceSpan.textContent = `${formatPrice(p.prixVente)}€`;
    
    // Append elements to product item
    productItem.appendChild(nameSpan);
    productItem.appendChild(priceSpan);
    
    // Append product item to products container
    productsDiv.appendChild(productItem);
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
  cart.forEach((item, index) => {
    total += item.quantite * item.prix;
    const div = document.createElement("div");
    div.className = "cart-item";
    
    // Item name
    const itemName = document.createElement("span");
    itemName.className = "item-name";
    itemName.textContent = item.name;
    
    // Controls container
    const controlsContainer = document.createElement("div");
    controlsContainer.className = "item-controls";
    
    // Decrease quantity button
    const decreaseBtn = document.createElement("button");
    decreaseBtn.className = "quantity-btn";
    decreaseBtn.textContent = "-";
    decreaseBtn.onclick = () => {
      if (cart[index].quantite > 1) {
        cart[index].quantite--;
        renderCart();
      } else {
        removeFromCart(index);
      }
    };
    
    // Quantity display
    const quantitySpan = document.createElement("span");
    quantitySpan.className = "quantity";
    quantitySpan.textContent = item.quantite;
    
    // Increase quantity button
    const increaseBtn = document.createElement("button");
    increaseBtn.className = "quantity-btn";
    increaseBtn.textContent = "+";
    increaseBtn.onclick = () => {
      cart[index].quantite++;
      renderCart();
    };
    
    // Remove button
    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "✕";
    removeBtn.onclick = () => removeFromCart(index);
    
    // Append all controls
    controlsContainer.appendChild(decreaseBtn);
    controlsContainer.appendChild(quantitySpan);
    controlsContainer.appendChild(increaseBtn);
    controlsContainer.appendChild(removeBtn);
    
    // Append to main container
    div.appendChild(itemName);
    div.appendChild(controlsContainer);
    
    cartItemsDiv.appendChild(div);
  });
  
  // Format the total price
  totalSpan.textContent = formatPrice(total);
}

function removeFromCart(index) {
  // Remove item entirely
  cart.splice(index, 1);
  renderCart();
}

function createNotificationPopup() {
  // Check if popup already exists
  if (document.getElementById('notification-popup')) {
    return;
  }

  // Create popup container
  const popup = document.createElement('div');
  popup.id = 'notification-popup';
  popup.className = 'notification-popup';
  
  // Create message element
  const message = document.createElement('div');
  message.className = 'notification-message';
  
  // Create close button
  const closeBtn = document.createElement('span');
  closeBtn.className = 'notification-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.onclick = hideNotification;
  
  // Assemble popup
  popup.appendChild(message);
  popup.appendChild(closeBtn);
  
  // Add to document
  document.body.appendChild(popup);
  
  // Add CSS if not already in your style.css
  const style = document.createElement('style');
  style.textContent = `
    .notification-popup {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      padding: 1.5rem;
      z-index: 2000;
      min-width: 300px;
      max-width: 80%;
      display: none;
      text-align: center;
      animation: fadeIn 0.3s ease-out;
    }
    
    .notification-success {
      border-top: 5px solid #2ecc71;
    }
    
    .notification-error {
      border-top: 5px solid #e74c3c;
    }
    
    .notification-message {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
    }
    
    .notification-close {
      position: absolute;
      top: 0.5rem;
      right: 1rem;
      font-size: 1.5rem;
      cursor: pointer;
      color: #777;
    }
    
    .notification-close:hover {
      color: #333;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translate(-50%, -60%); }
      to { opacity: 1; transform: translate(-50%, -50%); }
    }
  `;
  document.head.appendChild(style);
}

// Show notification
function showNotification(message, type = 'success') {
  // Create popup if it doesn't exist
  createNotificationPopup();
  
  const popup = document.getElementById('notification-popup');
  const messageEl = popup.querySelector('.notification-message');
  
  // Set message and type
  messageEl.textContent = message;
  popup.className = 'notification-popup';
  popup.classList.add(`notification-${type}`);
  
  // Show popup
  popup.style.display = 'block';
  
  // Auto-hide after 3 seconds
  setTimeout(hideNotification, 3000);
}

// Hide notification
function hideNotification() {
  const popup = document.getElementById('notification-popup');
  if (popup) {
    popup.style.display = 'none';
  }
}

// Modify the buy button click handler
buyBtn.onclick = async () => {
  if (cart.length === 0) return;
  
  try {
    const res = await fetch("/api/acheter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart })
    });
    
    if (res.ok) {

      const responseData = await res.json();
      showNotification("Achat réussi !", "success");
      cart = [];
      renderCart();
      fetchProducts();

    } else {
      try {
        const errorData = await res.text();
        
        // Check if the error is about insufficient stock
        if (errorData.includes("Not enough stock for")) {
          // Extract product name from error message
          const productName = errorData.replace("Not enough stock for ", "");
          showNotification(`Stock insuffisant pour: ${productName}`, "error");
        } else {
          showNotification("Échec de l'achat: " + errorData, "error");
        }
      } catch (parseError) {
        // Fallback error message if response can't be parsed
        showNotification("Échec de l'achat. Veuillez réessayer.", "error");
      }


    }
  } catch (error) {
    console.error("Error during purchase:", error);
    showNotification("Erreur de connexion. Veuillez réessayer.", "error");
  }
};

// History modal functionality
async function showHistory() {
  try {
    const res = await fetch("/api/getHistory");
    if (!res.ok) {
      throw new Error("Failed to fetch history");
    }
    
    const history = await res.json();
    
    // Clear previous content
    historyContent.innerHTML = "";
    
    // Display history items
    if (history.length === 0) {
      historyContent.innerHTML = "<p>Aucune transaction trouvée.</p>";
    } else {
      history.forEach(item => {
        const historyItem = document.createElement("div");
        historyItem.className = "history-item";
        
        const itemInfo = document.createElement("div");
        itemInfo.innerHTML = `<strong>${item.produit}</strong> - Quantité: ${item.quantite}`;
        
        const itemDate = document.createElement("div");
        itemDate.className = "history-date";
        itemDate.textContent = formatDate(item.heure);
        
        historyItem.appendChild(itemInfo);
        historyItem.appendChild(itemDate);
        
        historyContent.appendChild(historyItem);
      });
    }
    
    // Show the modal
    historyModal.style.display = "block";
    
  } catch (error) {
    console.error("Error fetching history:", error);
    alert("Erreur lors du chargement de l'historique.");
  }
}

// Event listeners for the history modal
historyBtn.addEventListener("click", showHistory);

closeBtn.addEventListener("click", () => {
  historyModal.style.display = "none";
});

// Close modal when clicking outside of it
window.addEventListener("click", (event) => {
  if (event.target === historyModal) {
    historyModal.style.display = "none";
  }
});
// Stock button functionality
document.getElementById('stockBtn').addEventListener('click', function() {
  window.location.href = 'stock.html';
});
// Initialize
document.addEventListener("DOMContentLoaded", function() {
  fetchProducts();
  
  // Set up event listeners for history modal
  historyBtn.addEventListener("click", showHistory);
  closeBtn.addEventListener("click", () => {
    historyModal.style.display = "none";
  });
  
  window.addEventListener("click", (e) => {
    if (e.target === historyModal) {
      historyModal.style.display = "none";
    }
  });
  
  // Improve navigation to stock page
  document.getElementById('stockBtn').addEventListener('click', function() {
    window.location.replace('stock.html');
  });
});