# Système de Paiement des Factures

## Vue d'ensemble

Le système permet aux clients de payer leurs factures en ligne sans créer de compte, via un lien sécurisé envoyé par email.

## Architecture

### 1. Envoi de la facture
- **Route**: `POST /api/organisations/[orgId]/factures/[factureId]/send`
- Génère un token d'accès unique valide 30 jours
- Envoie un email au client avec le lien de paiement
- Utilise Resend pour l'envoi d'emails

### 2. Page de paiement publique
- **Route**: `/facture/[factureId]/pay?token=xxx`
- Accessible sans authentification
- Vérifie la validité du token
- Affiche les détails de la facture
- Intègre Stripe Elements pour le paiement

### 3. APIs

#### GET /api/facture/[factureId]/info
- Récupère les informations de la facture
- Vérifie le token d'accès
- Vérifie l'expiration du token

#### POST /api/facture/[factureId]/create-payment
- Crée un PaymentIntent Stripe
- Retourne le clientSecret pour Stripe Elements
- Enregistre le PaymentIntent ID dans la facture

## Variables d'environnement requises

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Resend (Email)
RESEND_API_KEY=re_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Flux de paiement

1. L'entreprise envoie la facture via le bouton "Envoyer"
2. Le client reçoit un email avec un lien de paiement
3. Le client clique sur le lien et accède à la page de paiement
4. Le client clique sur "Payer maintenant" pour initialiser le paiement
5. Stripe Elements s'affiche avec le formulaire de paiement
6. Le client entre ses informations de carte
7. Le paiement est traité par Stripe
8. Le client est redirigé vers une page de confirmation

## Sécurité

- Token unique par facture (UUID)
- Expiration du token après 30 jours
- Validation du token à chaque requête
- Pas d'accès sans token valide
- Paiement sécurisé via Stripe

## Fonctionnalités

- ✅ Envoi d'email avec lien de paiement
- ✅ Page de paiement responsive
- ✅ Intégration Stripe Elements
- ✅ Validation du token
- ✅ Affichage des détails de la facture
- ✅ Bouton d'impression PDF
- ✅ Page de confirmation après paiement
- ✅ Copie du lien de paiement depuis les détails de la facture

## Migration Prisma

Exécuter la migration pour ajouter les champs nécessaires :

```bash
npx prisma migrate dev
```

Cela ajoutera :
- `tokenAcces` (String, unique, default: uuid)
- `tokenExpiresAt` (DateTime, nullable)

## Template Email

L'email envoyé contient :
- Nom de l'entreprise
- Numéro de facture
- Montant TTC
- Date d'échéance
- Bouton "Voir et payer la facture"
- Informations de l'entreprise (adresse, SIRET)
