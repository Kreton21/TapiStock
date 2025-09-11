#!/bin/bash

# Base URL of your backend
BASE_URL="http://localhost:9090"

echo "=== Creating products ==="
curl -s -X POST "$BASE_URL/api/creerProduit" \
-H "Content-Type: application/json" \
-d '{"nom":"applejuice","prixVente":2,"stock":10,"category":"boisson"}'
echo -e "\n"

curl -s -X POST "$BASE_URL/api/creerProduit" \
-H "Content-Type: application/json" \
-d '{"nom":"orangejuice","prixVente":3,"stock":5,"category":"boisson"}'
echo -e "\n"

echo "=== Adding stock ==="
curl -s "$BASE_URL/api/ajouterStock?produit=applejuice&prix_achat=1&quantite=5"
echo -e "\n"

echo "=== Buying products ==="
curl -s -X POST "$BASE_URL/api/acheter" \
-H "Content-Type: application/json" \
-d '{"items":[{"name":"applejuice","quantite":3},{"name":"orangejuice","quantite":2}]}'
echo -e "\n"

echo "=== Get current stock ==="
curl -s "$BASE_URL/api/getStock"
echo -e "\n"

echo "=== Get sales history ==="
curl -s "$BASE_URL/api/getHistory"
echo -e "\n"
