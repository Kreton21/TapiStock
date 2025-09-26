#!/bin/bash

# Base URL of your backend
BASE_URL="http://localhost:9090"

echo "=== Creating products ==="
# Beverages
curl -s -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Bubble Tea Taro","prixVente":550,"stock":20,"category":"boisson"}'
echo -e "\n"
curl -s -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Bubble Tea Matcha","prixVente":550,"stock":20,"category":"boisson"}'
echo -e "\n"
curl -s -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Thé Jasmin","prixVente":350,"stock":30,"category":"boisson"}'
echo -e "\n"
curl -s -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Thé Oolong","prixVente":380,"stock":25,"category":"boisson"}'
echo -e "\n"
curl -s -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Lait de Coco","prixVente":420,"stock":15,"category":"boisson"}'
echo -e "\n"

# Snacks
curl -s -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Bao au Porc","prixVente":450,"stock":12,"category":"snack"}'
echo -e "\n"
curl -s -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Bao Végétarien","prixVente":430,"stock":10,"category":"snack"}'
echo -e "\n"
curl -s -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Dumplings Crevette","prixVente":650,"stock":15,"category":"snack"}'
echo -e "\n"
curl -s -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Spring Rolls","prixVente":580,"stock":18,"category":"snack"}'
echo -e "\n"
curl -s -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Mochi Glacé","prixVente":390,"stock":25,"category":"snack"}'
echo -e "\n"

# Desserts
curl -s -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Tapioca Pudding","prixVente":420,"stock":20,"category":"dessert"}'
echo -e "\n"
curl -s -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Gâteau au Thé Vert","prixVente":530,"stock":12,"category":"dessert"}'
echo -e "\n"
curl -s -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Cheesecake Yuzu","prixVente":580,"stock":10,"category":"dessert"}'
echo -e "\n"
curl -s -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Dorayaki","prixVente":450,"stock":15,"category":"dessert"}'
echo -e "\n"
curl -s -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Beignets de Sésame","prixVente":390,"stock":18,"category":"dessert"}'
echo -e "\n"

# Merchandise
curl -s -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Tasse à Thé","prixVente":1250,"stock":8,"category":"merchandise"}'
echo -e "\n"
curl -s -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Set de Baguettes","prixVente":890,"stock":12,"category":"merchandise"}'
echo -e "\n"
curl -s -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Théière Traditionnelle","prixVente":2450,"stock":5,"category":"merchandise"}'
echo -e "\n"
curl -s -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Boîte à Thé","prixVente":1590,"stock":10,"category":"merchandise"}'
echo -e "\n"
curl -s -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Infuseur à Thé","prixVente":750,"stock":15,"category":"merchandise"}'
echo -e "\n"

echo "=== Adding stock ==="
# Add stock to various products
curl -s "$BASE_URL/api/ajouterStock?produit=Bubble%20Tea%20Taro&prix_achat=220&quantite=15"
echo -e "\n"
curl -s "$BASE_URL/api/ajouterStock?produit=Bubble%20Tea%20Matcha&prix_achat=240&quantite=15"
echo -e "\n"
curl -s "$BASE_URL/api/ajouterStock?produit=Bao%20au%20Porc&prix_achat=180&quantite=10"
echo -e "\n"
curl -s "$BASE_URL/api/ajouterStock?produit=Dumplings%20Crevette&prix_achat=260&quantite=12"
echo -e "\n"
curl -s "$BASE_URL/api/ajouterStock?produit=Tapioca%20Pudding&prix_achat=170&quantite=15"
echo -e "\n"
curl -s "$BASE_URL/api/ajouterStock?produit=Tasse%20à%20Thé&prix_achat=550&quantite=5"
echo -e "\n"

echo "=== Making transactions ==="

# Transaction 1 - Morning tea and snacks
echo "Transaction 1 - Morning tea order"
curl -s -X POST "$BASE_URL/api/acheter" -H "Content-Type: application/json" \
-d '{"items":[{"name":"Thé Jasmin","quantite":2},{"name":"Bao Végétarien","quantite":1}]}'
echo -e "\n"
sleep 1

# Transaction 2 - Bubble tea order
echo "Transaction 2 - Bubble tea order"
curl -s -X POST "$BASE_URL/api/acheter" -H "Content-Type: application/json" \
-d '{"items":[{"name":"Bubble Tea Taro","quantite":3},{"name":"Bubble Tea Matcha","quantite":2},{"name":"Mochi Glacé","quantite":4}]}'
echo -e "\n"
sleep 1

# Transaction 3 - Lunch special
echo "Transaction 3 - Lunch special"
curl -s -X POST "$BASE_URL/api/acheter" -H "Content-Type: application/json" \
-d '{"items":[{"name":"Bao au Porc","quantite":2},{"name":"Dumplings Crevette","quantite":1},{"name":"Thé Oolong","quantite":2}]}'
echo -e "\n"
sleep 1

# Transaction 4 - Tea set purchase
echo "Transaction 4 - Tea set purchase"
curl -s -X POST "$BASE_URL/api/acheter" -H "Content-Type: application/json" \
-d '{"items":[{"name":"Tasse à Thé","quantite":1},{"name":"Set de Baguettes","quantite":1},{"name":"Infuseur à Thé","quantite":1}]}'
echo -e "\n"
sleep 1

# Transaction 5 - Dessert order
echo "Transaction 5 - Dessert order"
curl -s -X POST "$BASE_URL/api/acheter" -H "Content-Type: application/json" \
-d '{"items":[{"name":"Tapioca Pudding","quantite":2},{"name":"Gâteau au Thé Vert","quantite":1},{"name":"Lait de Coco","quantite":3}]}'
echo -e "\n"
sleep 1

# Transaction 6 - Big group order
echo "Transaction 6 - Big group order"
curl -s -X POST "$BASE_URL/api/acheter" -H "Content-Type: application/json" \
-d '{"items":[{"name":"Bubble Tea Taro","quantite":4},{"name":"Bubble Tea Matcha","quantite":3},{"name":"Spring Rolls","quantite":5},{"name":"Dumplings Crevette","quantite":4},{"name":"Bao au Porc","quantite":3}]}'
echo -e "\n"
sleep 1

# Transaction 7 - Tea connoisseur
echo "Transaction 7 - Tea connoisseur"
curl -s -X POST "$BASE_URL/api/acheter" -H "Content-Type: application/json" \
-d '{"items":[{"name":"Théière Traditionnelle","quantite":1},{"name":"Boîte à Thé","quantite":1},{"name":"Thé Jasmin","quantite":2},{"name":"Thé Oolong","quantite":2}]}'
echo -e "\n"
sleep 1

# Transaction 8 - Dessert party
echo "Transaction 8 - Dessert party"
curl -s -X POST "$BASE_URL/api/acheter" -H "Content-Type: application/json" \
-d '{"items":[{"name":"Dorayaki","quantite":3},{"name":"Mochi Glacé","quantite":5},{"name":"Beignets de Sésame","quantite":4},{"name":"Cheesecake Yuzu","quantite":2}]}'
echo -e "\n"
sleep 1

# Transaction 9 - Gift shop
echo "Transaction 9 - Gift shop"
curl -s -X POST "$BASE_URL/api/acheter" -H "Content-Type: application/json" \
-d '{"items":[{"name":"Tasse à Thé","quantite":2},{"name":"Set de Baguettes","quantite":2},{"name":"Infuseur à Thé","quantite":1}]}'
echo -e "\n"
sleep 1

# Transaction 10 - Evening snacks
echo "Transaction 10 - Evening snacks"
curl -s -X POST "$BASE_URL/api/acheter" -H "Content-Type: application/json" \
-d '{"items":[{"name":"Spring Rolls","quantite":3},{"name":"Bao Végétarien","quantite":2},{"name":"Lait de Coco","quantite":2}]}'
echo -e "\n"

echo "=== Get current stock ==="
curl -s "$BASE_URL/api/getStock"
echo -e "\n"

echo "=== Get sales history ==="
curl -s "$BASE_URL/api/getHistory"
echo -e "\n"