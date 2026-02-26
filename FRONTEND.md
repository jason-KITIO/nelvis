# Guide Frontend - Nelvis

## Architecture

### Providers
- **AuthProvider** - Gestion globale de l'authentification (token, user)
- **QueryProvider** - React Query pour le cache et les requêtes
- **ThemeProvider** - Gestion du thème dark/light

### Structure
```
src/
├── types/           # Types TypeScript
├── services/        # Services API
├── hooks/           # React Query hooks
├── providers/       # Context providers
└── components/      # Composants React
```

## Utilisation

### 1. Authentification

```tsx
import { useAuth } from '@/providers/auth-provider';

function MyComponent() {
  const { user, token, setAuth, logout, isLoading } = useAuth();

  if (isLoading) return <div>Chargement...</div>;
  if (!user) return <div>Non connecté</div>;

  return <div>Bonjour {user.firstName}</div>;
}
```

### 2. Inscription / Connexion

Les formulaires sont déjà connectés :
- `SignupForm` - Utilise `useRegister` + `useAuth`
- `LoginForm` - Utilise `useLogin` + `useAuth`

### 3. Organisations

```tsx
import { useOrganisations, useCreateOrganisation } from '@/hooks';
import { useAuth } from '@/providers/auth-provider';

function OrganisationsList() {
  const { token } = useAuth();
  const { data, isLoading } = useOrganisations(token);
  const createOrg = useCreateOrganisation();

  const handleCreate = async () => {
    await createOrg.mutateAsync({
      token: token!,
      data: {
        name: 'Mon Entreprise',
        formeJuridique: 'SAS',
        pays: 'France',
        adresse: '123 rue Example',
      },
    });
  };

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div>
      {data?.organisations.map(org => (
        <div key={org.id}>{org.name}</div>
      ))}
      <button onClick={handleCreate}>Créer</button>
    </div>
  );
}
```

### 4. Membres

```tsx
import { useOrgMembers, useInviteMember } from '@/hooks';

function MembersList({ orgId }: { orgId: string }) {
  const { token } = useAuth();
  const { data } = useOrgMembers(token, orgId);
  const inviteMember = useInviteMember();

  const handleInvite = async () => {
    await inviteMember.mutateAsync({
      token: token!,
      orgId,
      data: { email: 'user@example.com', role: 'MEMBER' },
    });
  };

  return (
    <div>
      {data?.members.map(member => (
        <div key={member.id}>
          {member.user.firstName} - {member.role}
        </div>
      ))}
    </div>
  );
}
```

### 5. Modules

```tsx
import { useOrgModules, useActivateModule } from '@/hooks';

function ModulesSettings({ orgId }: { orgId: string }) {
  const { token } = useAuth();
  const { data } = useOrgModules(token, orgId);
  const activateModule = useActivateModule();

  const handleActivate = async (module: ModuleName) => {
    await activateModule.mutateAsync({
      token: token!,
      orgId,
      module,
    });
  };

  return (
    <div>
      <div>Juridique: {data?.modules.juridique ? 'Actif' : 'Inactif'}</div>
      <button onClick={() => handleActivate('juridique')}>
        Activer Juridique
      </button>
    </div>
  );
}
```

## Hooks disponibles

### Authentification
- `useRegister()` - Inscription
- `useLogin()` - Connexion
- `useLogout()` - Déconnexion
- `useRefreshToken()` - Renouveler token
- `useForgotPassword()` - Mot de passe oublié
- `useResetPassword()` - Réinitialiser mot de passe
- `useMe(token)` - Profil utilisateur
- `useUpdateProfile()` - Modifier profil
- `useChangePassword()` - Changer mot de passe

### Organisations
- `useOrganisations(token)` - Liste organisations
- `useOrganisation(token, orgId)` - Détail organisation
- `useCreateOrganisation()` - Créer organisation
- `useUpdateOrganisation()` - Modifier organisation
- `useDeleteOrganisation()` - Supprimer organisation
- `useUpdateBranding()` - Modifier charte graphique

### Membres
- `useOrgMembers(token, orgId)` - Liste membres
- `useInviteMember()` - Inviter membre
- `useUpdateMemberRole()` - Changer rôle
- `useRemoveMember()` - Retirer membre

### Modules
- `useOrgModules(token, orgId)` - Liste modules
- `useActivateModule()` - Activer module
- `useDeactivateModule()` - Désactiver module

## Gestion des erreurs

Tous les hooks retournent `error` et `isError` :

```tsx
const { data, error, isError, isLoading } = useOrganisations(token);

if (isError) {
  return <div>Erreur: {error.message}</div>;
}
```

## Cache et invalidation

React Query gère automatiquement le cache. Les mutations invalident automatiquement les requêtes concernées :

```tsx
// Créer une organisation invalide automatiquement useOrganisations
const createOrg = useCreateOrganisation();
await createOrg.mutateAsync({ token, data });
// useOrganisations se recharge automatiquement
```
