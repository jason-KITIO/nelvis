# Système de Gestion des Erreurs

Le système de gestion des erreurs est maintenant intégré dans toute l'application via un contexte global.

## Utilisation

### Dans n'importe quel composant client :

```tsx
import { useError } from '@/hooks';

function MonComposant() {
  const { showError } = useError();

  const handleAction = async () => {
    try {
      // Votre code
    } catch (error: any) {
      showError(error?.message || "Une erreur s'est produite");
      // Ou avec un titre personnalisé :
      showError("Message d'erreur", "Titre personnalisé");
    }
  };

  return <button onClick={handleAction}>Action</button>;
}
```

## Composants déjà intégrés

- ✅ LoginForm
- ✅ SignupForm  
- ✅ CreateOrganisationForm

## Avantages

- Affichage cohérent des erreurs dans toute l'application
- Messages en français
- Interface utilisateur professionnelle avec Dialog
- Gestion centralisée
