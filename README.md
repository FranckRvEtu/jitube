# MathBot - Assistant Mathématique pour Enfants

MathBot est une application web interactive conçue pour aider les enfants, en particulier ceux atteints d'autisme, à apprendre les mathématiques de manière ludique et adaptée. L'application utilise l'IA (Mistral) pour fournir des explications personnalisées et adaptées au niveau de l'enfant.

## Fonctionnalités

- 🤖 Interface de chat interactive avec un robot assistant
- 🎯 Explications adaptées aux enfants autistes
- 🎤 Support de la reconnaissance vocale
- 🔊 Synthèse vocale pour les explications
- 📱 Interface responsive et intuitive
- 🎨 Design attractif et rassurant

## Technologies Utilisées

- React avec TypeScript
- Tailwind CSS pour le style
- Mistral AI pour le traitement du langage naturel
- Web Speech API pour la reconnaissance vocale et la synthèse vocale
- React Type Animation pour les animations de texte
- Lucide React pour les icônes

## Structure du Code

### Composants Principaux

#### Assistant.tsx
Le composant principal qui gère toute l'interface de chat.

```typescript
// États principaux
const [messages, setMessages] = useState<Message[]>(); // Messages du chat
const [selectedExplanation, setSelectedExplanation] = useState<string | null>(); // Explication active
const [isPanelOpen, setIsPanelOpen] = useState(false); // État du panneau d'explication
```

### Fonctionnalités Clés

#### 1. Gestion du Chat
- Messages utilisateur et robot
- Historique des conversations
- Animations de texte pour les réponses du robot

#### 2. Reconnaissance Vocale
```typescript
const handleVoiceInput = () => {
  // Initialisation de la reconnaissance vocale
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  // Configuration et gestion des événements
};
```

#### 3. Synthèse Vocale
```typescript
const speakText = (text: string) => {
  // Configuration de la synthèse vocale
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'fr-FR';
  // Paramètres de voix adaptés aux enfants
};
```

#### 4. Communication avec Mistral AI
```typescript
const handleSubmit = async () => {
  // Envoi de la requête à l'API Mistral
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    // Configuration de la requête
  });
  // Traitement de la réponse
};
```

## Interface Utilisateur

### 1. Zone de Chat
- Messages alternés utilisateur/robot
- Bulles de dialogue stylisées
- Défilement automatique

### 2. Panneau d'Explication
- Panneau coulissant à droite
- Bouton de synthèse vocale
- Mise en forme adaptée aux enfants

### 3. Contrôles
- Champ de saisie de texte
- Bouton de reconnaissance vocale
- Bouton d'envoi

## Personnalisation

### Modification du Style
Le style est principalement géré via Tailwind CSS. Les classes principales sont :

```css
/* Conteneur principal */
.bg-gradient-to-b from-blue-400 to-purple-500

/* Bulles de dialogue */
.bg-purple-500 /* Messages utilisateur */
.bg-white border-2 border-purple-100 /* Messages robot */

/* Panneau d'explication */
.bg-white/95 backdrop-blur-sm
```

### Configuration de l'IA
Modifiez le prompt système dans `handleSubmit` pour ajuster le comportement du robot :

```typescript
{
  role: "system",
  content: "Tu es un assistant mathématique amical..."
}
```

## Installation et Démarrage

1. Clonez le repository
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier `.env` avec votre clé API Mistral :
   ```
   MISTRAL_API_KEY=votre_clé_api
   ```
4. Démarrez l'application :
   ```bash
   npm run dev
   ```

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer des améliorations
- Soumettre des pull requests

## Licence

MIT License