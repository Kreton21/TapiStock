document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  if (!auth.checkAuthOnLoad()) {
      return; // Will redirect to login
  }
  
  // Set current user in header
  document.getElementById('currentUser').textContent = auth.getUsername();
  
  // Add logout handler
  document.getElementById('logoutBtn').addEventListener('click', function() {
      auth.logout();
  });
  
  const addProductBtn = document.getElementById('addProductBtn');
  const restockBtn = document.getElementById('restockBtn');
  const addProductModal = document.getElementById('addProductModal'); 
  const stockTableBody = document.getElementById('stockTableBody');
  const restockModal = document.getElementById('restockModal');
  const saveRestockBtn = document.getElementById('saveRestockBtn');
  const cancelRestockModalBtn = document.getElementById('cancelRestockModalBtn');

  // Show/hide add product modal
  addProductBtn.addEventListener('click', () => {
    addProductModal.style.display = 'block';
    loadCategories();
  });
  
  // Close modal when clicking X for add product
  addProductModal.querySelector('.close-modal').addEventListener('click', () => {
    addProductModal.style.display = 'none';
  });
  
  // Close modal when clicking outside for add product
  window.addEventListener('click', (e) => {
    if (e.target === addProductModal) {
      addProductModal.style.display = 'none';
    }
    if (e.target === restockModal) {
      restockModal.style.display = 'none';
    }
  });
  
  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (addProductModal.style.display === 'block') {
        addProductModal.style.display = 'none';
      }
      if (restockModal.style.display === 'block') {
        restockModal.style.display = 'none';
      }
    }
  });
  
  document.getElementById('cancelAddBtn').addEventListener('click', () => {
    addProductModal.style.display = 'none';
  });
  
  // Save new product
  document.getElementById('saveProductBtn').addEventListener('click', async () => {
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const category = document.getElementById('productCategory').value;
    
    if (!name || !price || !category || category === 'new_category') {
      alert('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      const response = await auth.makeAuthenticatedRequest('/api/creerProduit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nom: name,
          prixVente: parseInt(price),
          stock: 0,
          category: category
        })
      });
      
      if (!response) return; // Auth failed, already redirected
      
      if (response.ok) {
        alert('Produit ajouté avec succès');
        addProductModal.style.display = 'none';
        document.getElementById('productName').value = '';
        document.getElementById('productPrice').value = '';
        document.getElementById('productCategory').value = '';
        loadStock();
      } else {
        alert('Erreur lors de l\'ajout du produit');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur de connexion');
    }
  });
  
  // Open restock modal
  restockBtn.addEventListener('click', () => {
    restockModal.style.display = 'block';
    loadProductsForRestock();
  });
  
  // Close modal on X click for restock
  restockModal.querySelector('.close-modal').addEventListener('click', () => {
    restockModal.style.display = 'none';
  });

  // Cancel button inside restock modal
  cancelRestockModalBtn.addEventListener('click', () => {
    restockModal.style.display = 'none';
  });

  // Save restock
  saveRestockBtn.addEventListener('click', async () => {
    const product = document.getElementById('restockProduct').value;
    const quantity = document.getElementById('restockQuantity').value;
    const price = document.getElementById('restockPrice').value;
    
    if (!product || !quantity || !price) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      const response = await auth.makeAuthenticatedRequest(`/api/ajouterStock?produit=${encodeURIComponent(product)}&prix_achat=${price}&quantite=${quantity}`);
      
      if (!response) return; // Auth failed, already redirected
      
      if (response.ok) {
        alert('Stock ajouté avec succès');
        restockModal.style.display = 'none';
        document.getElementById('restockProduct').value = '';
        document.getElementById('restockQuantity').value = '';
        document.getElementById('restockPrice').value = '';
        loadStock();
      } else {
        alert('Erreur lors de l\'ajout du stock');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur de connexion');
    }
  });
  
  // Load products for restock dropdown
  async function loadProductsForRestock() {
    try {
      const response = await auth.makeAuthenticatedRequest('/api/getStock');
      if (!response) return; // Auth failed, already redirected
      
      const products = await response.json();
      
      const select = document.getElementById('restockProduct');
      select.innerHTML = '<option value="">Sélectionner un produit</option>';
      
      products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.nom;
        option.textContent = product.nom;
        select.appendChild(option);
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  async function loadCategories() {
    const select = document.getElementById('productCategory');
    // reset to only the default option
    select.innerHTML = '<option value="">Sélectionner une catégorie</option>';
    try {
      const res = await auth.makeAuthenticatedRequest('/api/getCategories');
      if (!res || !res.ok) return;
      const categories = await res.json();
      categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        select.appendChild(opt);
      });
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      // always add the "new category" option
      const newOpt = document.createElement('option');
      newOpt.value = 'new_category';
      newOpt.textContent = '+ Nouvelle catégorie';
      select.appendChild(newOpt);
    }
  }
  
  document.getElementById('productCategory').addEventListener('change', async function() {
    if (this.value !== 'new_category') return;
    const name = prompt('Entrez le nom de la nouvelle catégorie :');
    if (!name || !name.trim()) {
      this.value = '';
      return;
    }
    try {
      const res = await auth.makeAuthenticatedRequest('/api/createCategory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: name.trim() })
      });
      if (!res || !res.ok) {
        alert('Erreur création catégorie');
        this.value = '';
        return;
      }
      // insert new category before the "new" option
      const opt = document.createElement('option');
      opt.value = name.trim();
      opt.textContent = name.trim().charAt(0).toUpperCase() + name.trim().slice(1);
      const newOpt = this.querySelector('option[value="new_category"]');
      this.insertBefore(opt, newOpt);
      this.value = name.trim();
    } catch (e) {
      console.error(e);
      alert('Erreur réseau');
      this.value = '';
    }
  });
  
  // Load current stock
  async function loadStock() {
    try {
      const response = await auth.makeAuthenticatedRequest('/api/getStock');
      if (!response) return; // Auth failed, already redirected
      
      const products = await response.json();
      
      stockTableBody.innerHTML = '';
      
      products.forEach(product => {
        const row = document.createElement('tr');
        
        // Highlight low stock items
        const stockClass = product.stock < 5 ? 'low-stock' : '';
        
        row.innerHTML = `
          <td>${product.nom}</td>
          <td>${(product.prixVente / 100).toFixed(2)} €</td>
          <td class="${stockClass}">${product.stock}</td>
          <td>${product.category || 'Non catégorisé'}</td>
        `;
        
        stockTableBody.appendChild(row);
      });
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
  // Export data
  document.getElementById('exportBtn').addEventListener('click', async () => {
    try {
      const response = await auth.makeAuthenticatedRequest('/api/getStock');
      if (!response) return; // Auth failed, already redirected
      
      const products = await response.json();
      
      const csvContent = 'data:text/csv;charset=utf-8,' + 
        'Nom,Prix,Stock,Categorie\n' + 
        products.map(p => `"${p.nom}",${p.prixVente / 100},${p.stock},"${p.category || 'Non catégorisé'}"`).join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'stock_export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de l\'exportation');
    }
  });
  
  // Fast navigation back to main page
  document.querySelector('.back-btn').addEventListener('click', function(e) {
    e.preventDefault();
    window.location.replace('/main/index.html');
  });
  
  // Load stock on page load
  loadStock();
});