#!/bin/bash

# Base URL of your backend
BASE_URL="http://localhost:9090"

# Clean up old token file
TOKEN_FILE="/tmp/tapistock_token.txt"
rm -f "$TOKEN_FILE"

echo "=== Logging in ==="
# Login and save cookies + extract token
LOGIN_RESPONSE=$(curl -s -c /tmp/tapistock_cookies.txt -X POST "$BASE_URL/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}')

echo "Login response: $LOGIN_RESPONSE"
echo -e "\n"

# Check if login was successful
if [[ $LOGIN_RESPONSE == *"error"* ]] || [[ $LOGIN_RESPONSE == *"false"* ]]; then
  echo "Login failed! Exiting..."
  exit 1
fi

# Extract token using jq (or grep/sed if jq not available)
if command -v jq &> /dev/null; then
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
else
  # Fallback using grep and sed if jq is not installed
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | sed 's/"token":"\([^"]*\)"/\1/')
fi

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "Failed to extract token! Exiting..."
  exit 1
fi

echo "Token extracted: $TOKEN"
echo "$TOKEN" > "$TOKEN_FILE"
echo "Login successful! Token saved."
echo -e "\n"

# Helper function to make authenticated requests
# Send token directly in Authorization header (no "Bearer" prefix)
auth_curl() {
  curl -s -b /tmp/tapistock_cookies.txt \
    -H "Authorization: $TOKEN" \
    "$@"
}

echo "=== Creating products ==="
# Beverages
auth_curl -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Bubble Tea Taro","prixVente":550,"stock":20,"category":"boisson"}'
echo -e "\n"
auth_curl -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Bubble Tea Matcha","prixVente":550,"stock":20,"category":"boisson"}'
echo -e "\n"
auth_curl -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Thé Jasmin","prixVente":350,"stock":30,"category":"boisson"}'
echo -e "\n"
auth_curl -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Thé Oolong","prixVente":380,"stock":25,"category":"boisson"}'
echo -e "\n"
auth_curl -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Lait de Coco","prixVente":420,"stock":15,"category":"boisson"}'
echo -e "\n"

# Snacks
auth_curl -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Bao au Porc","prixVente":450,"stock":12,"category":"snack"}'
echo -e "\n"
auth_curl -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Bao Végétarien","prixVente":430,"stock":10,"category":"snack"}'
echo -e "\n"
auth_curl -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Dumplings Crevette","prixVente":650,"stock":15,"category":"snack"}'
echo -e "\n"
auth_curl -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Spring Rolls","prixVente":580,"stock":18,"category":"snack"}'
echo -e "\n"
auth_curl -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Mochi Glacé","prixVente":390,"stock":25,"category":"snack"}'
echo -e "\n"

# Desserts
auth_curl -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Tapioca Pudding","prixVente":420,"stock":20,"category":"dessert"}'
echo -e "\n"
auth_curl -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Gâteau au Thé Vert","prixVente":530,"stock":12,"category":"dessert"}'
echo -e "\n"
auth_curl -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Cheesecake Yuzu","prixVente":580,"stock":10,"category":"dessert"}'
echo -e "\n"
auth_curl -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Dorayaki","prixVente":450,"stock":15,"category":"dessert"}'
echo -e "\n"
auth_curl -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Beignets de Sésame","prixVente":390,"stock":18,"category":"dessert"}'
echo -e "\n"

# Merchandise
auth_curl -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Tasse à Thé","prixVente":1250,"stock":8,"category":"merchandise"}'
echo -e "\n"
auth_curl -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Set de Baguettes","prixVente":890,"stock":12,"category":"merchandise"}'
echo -e "\n"
auth_curl -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Théière Traditionnelle","prixVente":2450,"stock":5,"category":"merchandise"}'
echo -e "\n"
auth_curl -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Boîte à Thé","prixVente":1590,"stock":10,"category":"merchandise"}'
echo -e "\n"
auth_curl -X POST "$BASE_URL/api/creerProduit" -H "Content-Type: application/json" -d '{"nom":"Infuseur à Thé","prixVente":750,"stock":15,"category":"merchandise"}'
echo -e "\n"

echo "=== Adding stock ==="
auth_curl "$BASE_URL/api/ajouterStock?produit=Bubble%20Tea%20Taro&prix_achat=220&quantite=15"
echo -e "\n"
auth_curl "$BASE_URL/api/ajouterStock?produit=Bubble%20Tea%20Matcha&prix_achat=240&quantite=15"
echo -e "\n"
auth_curl "$BASE_URL/api/ajouterStock?produit=Bao%20au%20Porc&prix_achat=180&quantite=10"
echo -e "\n"
auth_curl "$BASE_URL/api/ajouterStock?produit=Dumplings%20Crevette&prix_achat=260&quantite=12"
echo -e "\n"
auth_curl "$BASE_URL/api/ajouterStock?produit=Tapioca%20Pudding&prix_achat=170&quantite=15"
echo -e "\n"
auth_curl "$BASE_URL/api/ajouterStock?produit=Tasse%20à%20Thé&prix_achat=550&quantite=5"
echo -e "\n"

echo "=== Making transactions ==="

echo "Transaction 1 - Morning tea order"
auth_curl -X POST "$BASE_URL/api/acheter" -H "Content-Type: application/json" \
-d '{"items":[{"name":"Thé Jasmin","quantite":2},{"name":"Bao Végétarien","quantite":1}]}'
echo -e "\n"
sleep 1

echo "Transaction 2 - Bubble tea order"
auth_curl -X POST "$BASE_URL/api/acheter" -H "Content-Type: application/json" \
-d '{"items":[{"name":"Bubble Tea Taro","quantite":3},{"name":"Bubble Tea Matcha","quantite":2},{"name":"Mochi Glacé","quantite":4}]}'
echo -e "\n"
sleep 1

echo "Transaction 3 - Lunch special"
auth_curl -X POST "$BASE_URL/api/acheter" -H "Content-Type: application/json" \
-d '{"items":[{"name":"Bao au Porc","quantite":2},{"name":"Dumplings Crevette","quantite":1},{"name":"Thé Oolong","quantite":2}]}'
echo -e "\n"
sleep 1

echo "Transaction 4 - Tea set purchase"
auth_curl -X POST "$BASE_URL/api/acheter" -H "Content-Type: application/json" \
-d '{"items":[{"name":"Tasse à Thé","quantite":1},{"name":"Set de Baguettes","quantite":1},{"name":"Infuseur à Thé","quantite":1}]}'
echo -e "\n"
sleep 1

echo "Transaction 5 - Dessert order"
auth_curl -X POST "$BASE_URL/api/acheter" -H "Content-Type: application/json" \
-d '{"items":[{"name":"Tapioca Pudding","quantite":2},{"name":"Gâteau au Thé Vert","quantite":1},{"name":"Lait de Coco","quantite":3}]}'
echo -e "\n"
sleep 1

echo "Transaction 6 - Big group order"
auth_curl -X POST "$BASE_URL/api/acheter" -H "Content-Type: application/json" \
-d '{"items":[{"name":"Bubble Tea Taro","quantite":4},{"name":"Bubble Tea Matcha","quantite":3},{"name":"Spring Rolls","quantite":5},{"name":"Dumplings Crevette","quantite":4},{"name":"Bao au Porc","quantite":3}]}'
echo -e "\n"
sleep 1

echo "Transaction 7 - Tea connoisseur"
auth_curl -X POST "$BASE_URL/api/acheter" -H "Content-Type: application/json" \
-d '{"items":[{"name":"Théière Traditionnelle","quantite":1},{"name":"Boîte à Thé","quantite":1},{"name":"Thé Jasmin","quantite":2},{"name":"Thé Oolong","quantite":2}]}'
echo -e "\n"
sleep 1

echo "Transaction 8 - Dessert party"
auth_curl -X POST "$BASE_URL/api/acheter" -H "Content-Type: application/json" \
-d '{"items":[{"name":"Dorayaki","quantite":3},{"name":"Mochi Glacé","quantite":5},{"name":"Beignets de Sésame","quantite":4},{"name":"Cheesecake Yuzu","quantite":2}]}'
echo -e "\n"
sleep 1

echo "Transaction 9 - Gift shop"
auth_curl -X POST "$BASE_URL/api/acheter" -H "Content-Type: application/json" \
-d '{"items":[{"name":"Tasse à Thé","quantite":2},{"name":"Set de Baguettes","quantite":2},{"name":"Infuseur à Thé","quantite":1}]}'
echo -e "\n"
sleep 1

echo "Transaction 10 - Evening snacks"
auth_curl -X POST "$BASE_URL/api/acheter" -H "Content-Type: application/json" \
-d '{"items":[{"name":"Spring Rolls","quantite":3},{"name":"Bao Végétarien","quantite":2},{"name":"Lait de Coco","quantite":2}]}'
echo -e "\n"

echo "=== Get current stock ==="
auth_curl "$BASE_URL/api/getStock"
echo -e "\n"

echo "=== Get sales history ==="
auth_curl "$BASE_URL/api/getHistory"
echo -e "\n"

echo "=== Logging out ==="
auth_curl -X POST "$BASE_URL/api/logout"
echo -e "\n"

# Clean up token and cookie files
rm -f "$TOKEN_FILE"
rm -f /tmp/tapistock_cookies.txt

echo "Done!"