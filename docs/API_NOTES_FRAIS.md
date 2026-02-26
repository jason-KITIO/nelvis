# API Notes de Frais - Documentation

## Vue d'ensemble

Le module Notes de Frais permet l'automatisation complète de la gestion des dépenses via OCR (Reconnaissance Optique de Caractères) avec AWS Textract.

## Fonctionnalités

- ✅ Upload de reçus/factures (multipart/form-data)
- ✅ Extraction automatique par IA : montant, date, marchand, TVA, catégorie
- ✅ Validation et correction manuelle des données OCR
- ✅ Catégorisation intelligente (Transport, Restauration, Hébergement, etc.)
- ✅ Liaison comptable (prêt pour export FEC)
- ✅ Traçabilité complète (AuditLog)

## Endpoints

### 1. Lister les notes de frais

```http
GET /api/organisations/:orgId/notes-frais
```

**Réponse :**
```json
{
  "notesDeFrais": [
    {
      "id": "uuid",
      "organisationId": "uuid",
      "userId": "uuid",
      "photoUrl": "https://cloudinary.com/...",
      "montantOcr": 45.50,
      "dateOcr": "2024-01-15T10:30:00Z",
      "categorieOcr": "RESTAURATION",
      "marchandOcr": "Restaurant Le Gourmet",
      "tvaOcr": 4.55,
      "statut": "EN_ATTENTE",
      "createdAt": "2024-01-15T10:35:00Z",
      "user": {
        "firstName": "Jean",
        "lastName": "Dupont"
      }
    }
  ]
}
```

### 2. Uploader un reçu (OCR automatique)

```http
POST /api/organisations/:orgId/notes-frais
Content-Type: multipart/form-data
```

**Body :**
```
file: [fichier image/pdf]
```

**Réponse :**
```json
{
  "noteDeFrais": {
    "id": "uuid",
    "photoUrl": "https://...",
    "montantOcr": 45.50,
    "dateOcr": "2024-01-15T10:30:00Z",
    "categorieOcr": "RESTAURATION",
    "marchandOcr": "Restaurant Le Gourmet",
    "tvaOcr": 4.55,
    "statut": "EN_ATTENTE"
  },
  "ocrData": {
    "montant": 45.50,
    "date": "2024-01-15T10:30:00Z",
    "categorie": "RESTAURATION",
    "marchand": "Restaurant Le Gourmet",
    "tva": 4.55,
    "raw": { }
  }
}
```

### 3. Détail d'une note de frais

```http
GET /api/organisations/:orgId/notes-frais/:noteId
```

### 4. Corriger/Valider les données OCR

```http
PATCH /api/organisations/:orgId/notes-frais/:noteId
Content-Type: application/json
```

**Body :**
```json
{
  "montantOcr": 50.00,
  "dateOcr": "2024-01-15T12:00:00Z",
  "categorieOcr": "TRANSPORT",
  "statut": "VALIDE"
}
```

### 5. Supprimer une note de frais

```http
DELETE /api/organisations/:orgId/notes-frais/:noteId
```

## Catégories automatiques

- **TRANSPORT** : Uber, Taxi, SNCF, Train, Avion, Parking
- **RESTAURATION** : Restaurant, Café, Boulangerie, Fast-food
- **HEBERGEMENT** : Hôtel, Airbnb, Booking
- **FOURNITURES** : Amazon, Bureau, Papeterie
- **CARBURANT** : Total, Shell, Esso, Essence
- **TELECOMMUNICATION** : Orange, SFR, Bouygues, Free
- **AUTRE** : Par défaut

## Configuration AWS Textract

Variables d'environnement requises :

```env
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

## Sécurité

- ✅ Authentification JWT requise
- ✅ Vérification d'accès à l'organisation
- ✅ Isolation multi-tenant stricte
- ✅ Upload sécurisé via Cloudinary
- ✅ Suppression réservée aux ADMIN

## Workflow recommandé

1. **Upload** : L'utilisateur scanne/upload un reçu
2. **IA Check** : AWS Textract extrait les données (statut: EN_ATTENTE)
3. **Validation** : L'utilisateur vérifie/corrige les données
4. **Validation finale** : Changement du statut à VALIDE
5. **Comptabilisation** : Export vers FEC/SAGE
