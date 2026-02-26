# Backend API - Nelvis

## Installation

```bash
# Installer les dépendances
pnpm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Générer le client Prisma
npx prisma generate

# Lancer les migrations
npx prisma migrate dev
```

## Variables d'environnement

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

## API Endpoints

### Authentification

#### POST /api/auth/register
Créer un compte utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+33612345678"
}
```

**Réponse (201):**
```json
{
  "user": { "id": "uuid", "email": "...", "firstName": "...", "lastName": "..." },
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

#### POST /api/auth/login
Connexion utilisateur.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Réponse (200):**
```json
{
  "user": { "id": "uuid", "email": "...", "firstName": "...", "lastName": "...", "avatarUrl": null },
  "organisations": [{ "id": "uuid", "name": "Mon Entreprise", "role": "OWNER" }],
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG..."
}
```

#### POST /api/auth/logout
Déconnexion (côté client, invalider le token).

**Réponse (200):**
```json
{ "message": "Déconnexion réussie" }
```

#### POST /api/auth/refresh
Renouveler l'access token.

**Body:**
```json
{ "refreshToken": "eyJhbG..." }
```

**Réponse (200):**
```json
{ "accessToken": "eyJhbG..." }
```

#### POST /api/auth/forgot-password
Demander un reset de mot de passe.

**Body:**
```json
{ "email": "user@example.com" }
```

**Réponse (200):**
```json
{ "message": "Si l'email existe, un lien a été envoyé" }
```

#### POST /api/auth/reset-password
Réinitialiser le mot de passe avec token.

**Body:**
```json
{
  "token": "eyJhbG...",
  "password": "NewPassword123"
}
```

**Réponse (200):**
```json
{ "message": "Mot de passe réinitialisé avec succès" }
```

#### GET /api/auth/me
Récupérer le profil de l'utilisateur connecté.

**Headers:**
```
Authorization: Bearer eyJhbG...
```

**Réponse (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+33612345678",
    "avatarUrl": null,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PATCH /api/auth/me
Modifier le profil utilisateur.

**Headers:**
```
Authorization: Bearer eyJhbG...
```

**Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+33698765432",
  "avatarUrl": "https://..."
}
```

**Réponse (200):**
```json
{
  "user": { "id": "uuid", "email": "...", "firstName": "Jane", "lastName": "Smith", ... }
}
```

#### PATCH /api/auth/me/password
Changer le mot de passe.

**Headers:**
```
Authorization: Bearer eyJhbG...
```

**Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456"
}
```

**Réponse (200):**
```json
{ "message": "Mot de passe modifié avec succès" }
```

## Structure

```
app/api/auth/
  ├── register/route.ts
  ├── login/route.ts
  ├── logout/route.ts
  ├── refresh/route.ts
  ├── forgot-password/route.ts
  ├── reset-password/route.ts
  └── me/
      ├── route.ts
      └── password/route.ts

src/lib/
  ├── prisma.ts    # Client Prisma
  ├── auth.ts      # Hash/verify password
  └── jwt.ts       # JWT sign/verify
```

## Sécurité

- Access token: 15 minutes
- Refresh token: 7 jours
- Reset token: 1 heure
- Mots de passe hashés avec bcrypt (10 rounds)


---

## Organisations

### GET /api/organisations
Lister les organisations de l'utilisateur.

**Headers:** `Authorization: Bearer <token>`

**Réponse (200):**
```json
{
  "organisations": [
    {
      "id": "uuid",
      "name": "Mon Entreprise",
      "role": "OWNER",
      "siret": "12345678901234",
      "logoUrl": "https://...",
      "modules": { "juridique": true, "facturation": false, ... }
    }
  ]
}
```

### POST /api/organisations
Créer une organisation.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Mon Entreprise",
  "siret": "12345678901234",
  "siren": "123456789",
  "formeJuridique": "SAS",
  "pays": "France",
  "adresse": "123 rue Example",
  "logoUrl": "https://..."
}
```

**Réponse (201):**
```json
{
  "organisation": { "id": "uuid", "name": "...", ... }
}
```

### GET /api/organisations/:orgId
Détail d'une organisation.

**Headers:** `Authorization: Bearer <token>`

**Réponse (200):**
```json
{
  "organisation": { "id": "uuid", "name": "...", "modules": {...}, ... }
}
```

### PATCH /api/organisations/:orgId
Modifier une organisation (ADMIN+).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "name": "Nouveau nom",
  "adresse": "Nouvelle adresse",
  ...
}
```

### DELETE /api/organisations/:orgId
Supprimer une organisation (OWNER uniquement).

**Headers:** `Authorization: Bearer <token>`

**Réponse (200):**
```json
{ "message": "Organisation supprimée" }
```

### PATCH /api/organisations/:orgId/branding
Modifier la charte graphique (ADMIN+).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "charteGraphique": {
    "primaryColor": "#FF0000",
    "logo": "https://...",
    ...
  }
}
```

---

## Membres

### GET /api/organisations/:orgId/members
Lister les membres.

**Headers:** `Authorization: Bearer <token>`

**Réponse (200):**
```json
{
  "members": [
    {
      "id": "uuid",
      "role": "OWNER",
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ]
}
```

### POST /api/organisations/:orgId/members/invite
Inviter un utilisateur (ADMIN+).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "email": "newuser@example.com",
  "role": "MEMBER"
}
```

**Réponse (201):**
```json
{
  "member": { "id": "uuid", "role": "MEMBER", "user": {...} }
}
```

### PATCH /api/organisations/:orgId/members/:userId/role
Changer le rôle d'un membre (ADMIN+).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{ "role": "ADMIN" }
```

### DELETE /api/organisations/:orgId/members/:userId
Retirer un membre (ADMIN+).

**Headers:** `Authorization: Bearer <token>`

**Réponse (200):**
```json
{ "message": "Membre retiré" }
```

---

## Modules

### GET /api/organisations/:orgId/modules
Lire les modules actifs.

**Headers:** `Authorization: Bearer <token>`

**Réponse (200):**
```json
{
  "modules": {
    "juridique": true,
    "facturation": false,
    "comptabilite": true,
    "rhPaie": false,
    "vocal": false,
    "logistique": false
  }
}
```

### PATCH /api/organisations/:orgId/modules/:module/activate
Activer un module (ADMIN+).

**Headers:** `Authorization: Bearer <token>`

**Réponse (200):**
```json
{
  "modules": { "juridique": true, ... }
}
```

### PATCH /api/organisations/:orgId/modules/:module/deactivate
Désactiver un module (OWNER uniquement).

**Headers:** `Authorization: Bearer <token>`

**Réponse (200):**
```json
{
  "modules": { "juridique": false, ... }
}
```

---

## Permissions

- **MEMBER**: Lecture seule
- **ADMIN**: Lecture + modification + inviter membres + activer modules
- **OWNER**: Tous les droits + supprimer organisation + désactiver modules


---

## Structure Frontend

### Types (`src/types/`)

**auth.ts** - Types pour l'authentification
- User, LoginRequest, RegisterRequest, AuthResponse
- RefreshTokenRequest, ForgotPasswordRequest, ResetPasswordRequest
- UpdateProfileRequest, ChangePasswordRequest

**organisation.ts** - Types pour les organisations
- Organisation, OrganisationWithModules, UserModule
- OrgMember, OrgMemberRole, ModuleName
- CreateOrganisationRequest, UpdateOrganisationRequest
- UpdateBrandingRequest, InviteMemberRequest, UpdateMemberRoleRequest

### Services (`src/services/`)

**auth.service.ts** - Service d'authentification
- register, login, logout, refresh
- forgotPassword, resetPassword
- getMe, updateProfile, changePassword

**organisation.service.ts** - Service des organisations
- getAll, create, getById, update, delete
- updateBranding
- getMembers, inviteMember, updateMemberRole, removeMember
- getModules, activateModule, deactivateModule

### Hooks (`src/hooks/`)

**use-auth.ts** - Hooks React Query pour l'authentification
- useRegister, useLogin, useLogout, useRefreshToken
- useForgotPassword, useResetPassword
- useMe, useUpdateProfile, useChangePassword

**use-organisation.ts** - Hooks React Query pour les organisations
- useOrganisations, useOrganisation
- useCreateOrganisation, useUpdateOrganisation, useDeleteOrganisation
- useUpdateBranding
- useOrgMembers, useInviteMember, useUpdateMemberRole, useRemoveMember
- useOrgModules, useActivateModule, useDeactivateModule

### Utilisation

```tsx
'use client';

import { useLogin, useOrganisations } from '@/hooks';
import { useState } from 'react';

export function MyComponent() {
  const [token, setToken] = useState<string | null>(null);
  const login = useLogin();
  const { data: orgs } = useOrganisations(token);

  const handleLogin = async () => {
    const result = await login.mutateAsync({
      email: 'user@example.com',
      password: 'password',
    });
    setToken(result.accessToken);
  };

  return <div>{/* ... */}</div>;
}
```
