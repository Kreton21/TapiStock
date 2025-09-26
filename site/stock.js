document.addEventListener('DOMContentLoaded', function() {
    const addProductBtn = document.getElementById('addProductBtn');
    const restockBtn = document.getElementById('restockBtn');
    const addProductForm = document.getElementById('addProductForm');
    const restockForm = document.getElementById('restockForm');
    const stockTableBody = document.getElementById('stockTableBody');
    
    // Show/hide forms
    addProductBtn.addEventListener('click', () => {
      addProductForm.style.display = 'flex';
      restockForm.style.display = 'none';
    });
    
    restockBtn.addEventListener('click', () => {
      restockForm.style.display = 'flex';
      addProductForm.style.display = 'none';
      loadProductsForRestock();
    });
    
    document.getElementById('cancelAddBtn').addEventListener('click', () => {
      addProductForm.style.display = 'none';
    });
    
    document.getElementById('cancelRestockBtn').addEventListener('click', () => {
      restockForm.style.display = 'none';
    });
    
    // Save new product
    document.getElementById('saveProductBtn').addEventListener('click', async () => {
      const name = document.getElementById('productName').value;
      const price = document.getElementById('productPrice').value;
      const category = document.getElementById('productCategory').value;
      
      if (!name || !price || !category) {
        alert('Veuillez remplir tous les champs');
        return;
      }
      
      try {
        const response = await fetch('/api/creerProduit', {
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
        
        if (response.ok) {
          alert('Produit ajouté avec succès');
          addProductForm.style.display = 'none';
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
    
    // Save restock
    document.getElementById('saveRestockBtn').addEventListener('click', async () => {
      const product = document.getElementById('restockProduct').value;
      const quantity = document.getElementById('restockQuantity').value;
      const price = document.getElementById('restockPrice').value;
      
      if (!product || !quantity || !price) {
        alert('Veuillez remplir tous les champs');
        return;
      }
      
      try {
        const response = await fetch(`/api/ajouterStock?produit=${encodeURIComponent(product)}&prix_achat=${price}&quantite=${quantity}`);
        
        if (response.ok) {
          alert('Stock ajouté avec succès');
          restockForm.style.display = 'none';
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
        const response = await fetch('/api/getStock');
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
    
    // Load current stock
    async function loadStock() {
      try {
        const response = await fetch('/api/getStock');
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
        const response = await fetch('/api/getStock');
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
      window.location.replace('index.html');
    });
    
    // Load stock on page load
    loadStock();
  });
