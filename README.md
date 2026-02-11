# Git Tool 🚀

Outil en ligne de commande pour Git avec génération automatique de messages de commit propulsée par l'IA.

## Description

Git Tool est un utilitaire CLI qui améliore votre workflow Git en générant automatiquement des messages de commit pertinents et descriptifs à partir des fichiers staged et de leurs différences. Utilisant l'IA Mistral (modèle `devstral-latest`), l'outil analyse vos modifications et produit des messages de commit suivant les conventions standards.

## Caractéristiques 

✨ **Génération intelligente** - Messages de commit générés par IA en analysant vos modifications  
📋 **Aperçu des fichiers** - Affichage coloré des fichiers staged avant génération  
🔍 **Confirmation interactive** - Validation avant de committer  
📊 **Statistiques de tokens** - Logs de l'utilisation de l'API Mistral  
⚡ **Interface élégante** - Banner ASCII et feedback visuel avec couleurs  
🎯 **Conventions standards** - Respect des conventions de commit (feat, fix, doc, etc.)  

## Installation

### Installation globale (recommandée)

```bash
npm install -g @fzed51/git-tool
```

### Installation locale pour développement

```bash
git clone <repository>
cd git-tool
yarn install
yarn build
```

## Utilisation

### Ligne de commande

Une fois installé globalement, utilisez la commande `git-commit` :

```bash
# 1. Ajoutez vos fichiers au staging
git add .

# 2. Générez et créez votre commit avec l'IA
git-commit
```

L'outil va :
1. Afficher les fichiers staged
2. Analyser les différences
3. Générer un message de commit via l'IA
4. Demander confirmation
5. Créer le commit

### Utilisation programmatique (API)

```typescript
import { generateCommitMessage, git, GitWrapper } from "@fzed51/git-tool";

// Générer un message de commit
const message = await generateCommitMessage();
console.log(message);

// Utiliser le wrapper git
const stagedFiles = await git.getStagedFiles();
console.log("Fichiers staged:", stagedFiles);

// Créer une instance personnalisée
const customGit = new GitWrapper({ cwd: "/path/to/repo" });
const diff = await customGit.getStagedDiff();
```

## Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet (ou dans votre répertoire home pour une configuration globale) :

```env
# Clé API Mistral (requis)
MISTRAL_API_KEY=votre_cle_api_mistral
MISTRAL_MODEL=devstral-latest
```

**Obtenir une clé API Mistral :**
1. Créez un compte sur [console.mistral.ai](https://console.mistral.ai)
2. Générez une clé API
3. Ajoutez-la à votre fichier `.env`

**⚠️ Sécurité :** Ne commitez jamais votre fichier `.env` ! Il est automatiquement ignoré par `.gitignore`.

## Développement

### Scripts disponibles

```bash
# Compiler TypeScript
yarn build

# Mode développement (exécution directe avec tsx)
yarn dev

# Linter et formatting (Biome)
yarn lint
yarn lint:fix
```

### Structure du projet

```
git-tool/
├── src/
│   ├── git-commit.ts       # CLI principale
│   └── lib/
│       ├── git-commit.ts   # Logique de génération
│       ├── git-wrapper.ts  # Wrapper pour commandes git
│       └── index.ts        # API publique
├── dist/                   # Fichiers compilés
├── package.json
└── tsconfig.json
```

## Technologies

- **TypeScript** - Langage principal (ESM)
- **Mistral AI** - Modèle `devstral-latest` pour la génération
- **Biome.js** - Linting et formatting ultra-rapide
- **Chalk** - Couleurs et style dans le terminal
- **Node.js** - ≥ 18.0.0

## Changelog

Voir [CHANGELOG.md](CHANGELOG.md) pour l'historique détaillé des versions.

### Versions récentes

- **v0.3.0** - Affichage des fichiers staged, feedback visuel amélioré
- **v0.2.0** - Banner ASCII, API publique, confirmation interactive
- **v0.0.1** - Version initiale avec wrapper Git et CLI basique

## Licence

MIT - Voir [LICENSE](LICENSE) pour plus de détails.

## Auteur

Fabien Sanchez

## Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.
