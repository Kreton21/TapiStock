# TapiStock


## API ENDPOINTS

### Create Product
POST /api/creerProduit
Body (JSON):
{ "nom": "applejuice", "prixVente": 2, "category": "boisson" }
Response (JSON):
{ "status": "ok", "produit": { "nom": "applejuice", "prixVente": 2, "category": "boisson", "stock": 0 } }

### Add Stock
GET /api/ajouterStock?produit=<name>&prix_achat=<value>&quantite=<value>
Response (JSON):
{ "status": "ok", "produit": "<name>", "ajout": <quantite>, "prixAchat": <value> }

### Buy Products
POST /api/acheter
Body (JSON):
{ "items": [ { "name": "applejuice", "quantite": 3 }, { "name": "orangejuice", "quantite": 2 } ] }
Response (JSON):
{ "status": "ok", "items": [ ... ] }

### Get Current Stock
GET /api/getStock
Response (JSON):
[ { "nom": "applejuice", "prixVente": 2, "category": "boisson", "stock": 7 }, ... ]

### Get Sales History
GET /api/getHistory
Response (JSON):
[ { "produit": "applejuice", "quantite": 3, "heure": "2025-09-10 14:00:01" }, ... ]