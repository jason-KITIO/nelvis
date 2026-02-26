# Changelog - Ajout du statut client et Pipeline CRM

## Modifications effectuées

### 1. Suppression de la page CRM Pipeline
- ✅ Supprimé le dossier `app/(auth)/organisation/[orgId]/crm/`

### 2. Ajout du champ statut dans le modèle Client
- ✅ Ajout de l'enum `ClientStatut` dans le schéma Prisma avec les valeurs :
  - PROSPECT
  - PROPOSE
  - NEGOCIE
  - GAGNE
  - PERDU
- ✅ Ajout du champ `statut` (facultatif) dans le modèle `Client` avec valeur par défaut `PROSPECT`
- ✅ Synchronisation de la base de données avec `prisma db push`
- ✅ Génération du client Prisma

### 3. Mise à jour des validations
- ✅ Ajout du champ `statut` (optionnel) dans `createClientSchema`
- ✅ Ajout du champ `statut` (optionnel) dans `updateClientSchema`

### 4. Mise à jour des types TypeScript
- ✅ Ajout du type `ClientStatut`
- ✅ Ajout du champ `statut` dans l'interface `Client`
- ✅ Ajout du champ `statut` dans `CreateClientRequest`
- ✅ Ajout du champ `statut` dans `UpdateClientRequest`

### 5. Mise à jour des composants
- ✅ **AddClientDialog** : Ajout du champ statut (facultatif) dans le formulaire
- ✅ **EditClientDialog** : Ajout du champ statut dans le formulaire de modification
- ✅ **Page Clients** : 
  - Ajout d'une vue "Pipeline" avec 3 onglets (Tableau, Grille, Pipeline)
  - Implémentation du drag & drop avec `@dnd-kit/core`
  - Affichage des clients par statut dans des colonnes
  - Mise à jour automatique du statut lors du drag & drop

### 6. Fonctionnalités implémentées

#### Ajout de client
- Le champ statut est facultatif lors de l'ajout d'un client
- Valeur par défaut : "PROSPECT"
- Sélection via un menu déroulant avec les 5 statuts

#### Modification de client
- Le statut peut être modifié via le formulaire d'édition
- Le statut peut être modifié par drag & drop dans la vue Pipeline

#### Vue Pipeline
- Affichage en 5 colonnes (Prospect, Proposé, Négocié, Gagné, Perdu)
- Compteur de clients par statut
- Drag & drop fluide entre les colonnes
- Overlay visuel pendant le drag
- Mise à jour automatique via API

## Installation des dépendances

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Utilisation

1. **Ajouter un client** : Cliquez sur "Nouveau client" et sélectionnez un statut (optionnel)
2. **Modifier le statut** : 
   - Via le formulaire d'édition
   - Par drag & drop dans la vue Pipeline
3. **Visualiser le pipeline** : Cliquez sur l'onglet "Pipeline" dans la page Clients

## Notes techniques

- Le drag & drop utilise `@dnd-kit/core` pour une meilleure performance
- Les mutations sont gérées avec React Query pour un cache optimisé
- Le statut par défaut est "PROSPECT" si non spécifié
- L'API PATCH `/api/organisations/[orgId]/clients/[clientId]` supporte la mise à jour du statut
