# Git Tool

Série d'outils pour Git incluant des fonctionnalités IA.

## Description

Ce projet vise à créer un ensemble d'outils pour améliorer et automatiser certaines tâches Git en utilisant l'intelligence artificielle.

## Outils

### 1. Générateur de messages de commit

À partir des fichiers modifiés ajoutés au staging et des différences, génère automatiquement un message de commit pertinent et descriptif.

## Installation

```bash
yarn install
```

## Configuration

Créez un fichier `.env` à la racine du projet avec les variables d'environnement suivantes :

```env
# Clé API pour le service d'IA (OpenAI, Anthropic, etc.)
MISTRAL_API_KEY=votre_cle_api_ici
```

**Note:** Le fichier `.env` ne doit jamais être commité dans le dépôt. Assurez-vous qu'il est dans le `.gitignore`.

## Développement

```bash
# Compiler TypeScript
yarn build

# Mode watch
yarn dev

# Linter
yarn lint
yarn lint:fix

# Formatter
yarn format
```

## Technologies

- **TypeScript** - Langage principal (mode ESM)
- **Biome.js** - Linting et formatting
- **Node.js** - Environnement d'exécution

## Licence

ISC
