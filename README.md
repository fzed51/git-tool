# Git Tool 🚀

Outil en ligne de commande pour Git avec génération automatique de messages de commit et de changelogs propulsée par l'IA.

## Description

Git Tool est un utilitaire CLI qui améliore votre workflow Git grâce à trois commandes principales :

- **`git-commit`** — Génère automatiquement des messages de commit pertinents et descriptifs à partir des fichiers staged et de leurs différences.
- **`git-changelog`** — Génère un changelog structuré (format Keep a Changelog) à partir de l'historique des commits entre deux versions.
- **`git-branch`** — Crée des branches Git formatées (`<type>/<ref>-<name>`) à partir d'une branche de base à jour, avec prompts interactifs.

L'outil utilise l'IA Mistral (modèle `mistral-small-latest` par défaut, configurable) pour analyser vos modifications et produire des messages suivant les conventions standards.

## Caractéristiques

✨ **Génération intelligente** - Messages de commit générés par IA en analysant vos modifications
📋 **Aperçu des fichiers** - Affichage coloré des fichiers staged avant génération
📝 **Changelog automatique** - Génération de changelog catégorisé (Added, Changed, Fixed, etc.)
🌿 **Création de branches** - Branches formatées `<type>/<ref>-<name>` avec détection automatique de la base
🔍 **Confirmation interactive** - Validation avant de committer ou de mettre à jour le changelog
📊 **Statistiques de tokens** - Logs de l'utilisation de l'API Mistral
⚡ **Interface élégante** - Banner ASCII et feedback visuel avec couleurs
🎯 **Conventions standards** - Respect des conventions de commit (feat, fix, doc, etc.) et Keep a Changelog
🧪 **Testé** - Suite de tests avec Jest

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

### `git-commit` — Génération de messages de commit

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

### `git-changelog` — Génération de changelog

Générez un changelog pour une nouvelle version à partir de l'historique Git :

```bash
# Génère un changelog pour la version 1.2.0 depuis le dernier tag
git-changelog 1.2.0

# Spécifier un tag de départ personnalisé
git-changelog 1.2.0 --from v1.1.0

# Générer sans committer automatiquement le CHANGELOG.md
git-changelog 1.2.0 --no-commit
```

L'outil va :
1. Détecter le dernier tag de version (ou utiliser `--from`)
2. Récupérer les commits depuis ce tag
3. Catégoriser les modifications via l'IA (Added, Changed, Fixed, Removed, etc.)
4. Demander confirmation
5. Mettre à jour le fichier `CHANGELOG.md` et créer un commit (sauf `--no-commit`)

### `git-branch` — Création de branches formatées

Créez des branches Git avec un nommage standardisé `<type>/<ref>-<name>` :

```bash
# Mode interactif (prompts pour type, ref et nom)
git-branch

# Spécifier tous les paramètres
git-branch --type feat --ref COM-123 --name login_page

# Branche sans nom descriptif
git-branch --type fix --ref #42 --noname

# Spécifier la branche d'origine (nommage laxiste)
git-branch --from dev               # résout vers develop
git-branch --from COM-123            # résout vers epic/COM-123-...

# Utiliser un type avec une ref contenant des caractères spéciaux
git-branch -t feat -r @ticket -n auth
```

**Types disponibles :** `feat`, `fix`, `epic`, `release`

**Format de branche :** `<type>/<ref>-<name>` ou `<type>/<ref>` (si `--noname`)

**Branche de base :** détectée automatiquement par priorité : `develop` > `dev` > `main` > `master`. La branche est mise à jour (`pull`) avant la création.

**Nommage intelligent :**
- Le nom est automatiquement slugifié (accents supprimés, espaces → `_`)
- Les références acceptent `#`, `@` et les caractères compatibles git
- L'option `--from` accepte des noms laxistes (ex: `dev` → `develop`, `COM-123` → `epic/COM-123-feature`)

L'outil va :
1. Détecter ou résoudre la branche de base
2. Poser les questions manquantes (type, ref, nom)
3. Formater et afficher le nom de la branche
4. Demander confirmation
5. Checkout + pull de la base, puis créer la nouvelle branche

### Utilisation programmatique (API)

```typescript
import {
  generateCommitMessage,
  generateChangelog,
  getLastVersionTag,
  getCommitsSinceLastVersion,
  updateChangelogFile,
  formatBranchName,
  detectBaseBranch,
  resolveFromBranch,
  createBranchFromBase,
  slugify,
  git,
  GitWrapper,
  chat,
} from "@fzed51/git-tool";

// Générer un message de commit
const message = await generateCommitMessage();
console.log(message);

// Générer un changelog
const tag = await getLastVersionTag();
const commits = await getCommitsSinceLastVersion(tag);
const changelog = await generateChangelog("1.0.0", commits);
await updateChangelogFile(changelog);

// Utiliser le wrapper git
const stagedFiles = await git.getStagedFiles();
console.log("Fichiers staged:", stagedFiles);

// Créer une instance personnalisée
const customGit = new GitWrapper({ cwd: "/path/to/repo" });
const diff = await customGit.getStagedDiff();

// Créer une branche formatée
const base = await detectBaseBranch();
const branch = formatBranchName("feat", "COM-123", "login page");
// → "feat/com-123-login_page"
await createBranchFromBase(branch, base);

// Résoudre un nom de branche laxiste
const resolved = await resolveFromBranch("dev"); // → "develop"

// Appeler directement l'API Mistral
const response = await chat({
  system: "Tu es un assistant.",
  prompt: "Résume ce code...",
});
```

## Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet (ou dans votre répertoire home pour une configuration globale) :

```env
# Clé API Mistral (requis)
MISTRAL_API_KEY=votre_cle_api_mistral

# Modèle Mistral (optionnel, défaut: mistral-small-latest)
MISTRAL_MODEL=mistral-small-latest
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

# Exécuter directement avec tsx (sans build)
yarn git-commit
yarn git-changelog <version>
yarn git-branch

# Tests
yarn test
yarn test:watch
yarn test:coverage

# Linter et formatting (Biome)
yarn lint
yarn lint:fix
```

### Structure du projet

```
git-tool/
├── src/
│   ├── git-commit.ts        # CLI git-commit
│   ├── git-changelog.ts     # CLI git-changelog
│   ├── git-branch.ts        # CLI git-branch
│   └── lib/
│       ├── index.ts          # API publique (exports)
│       ├── git-commit.ts     # Logique de génération de commit
│       ├── git-commit.test.ts# Tests unitaires
│       ├── git-changelog.ts  # Logique de génération de changelog
│       ├── git-branch.ts     # Logique de création de branches
│       ├── git-wrapper.ts    # Wrapper pour commandes git
│       └── mistral.ts        # Client Mistral AI
├── biome.json                # Configuration Biome (linter/formatter)
├── jest.config.js            # Configuration Jest
├── tsconfig.json             # Configuration TypeScript
└── package.json
```

## Technologies

- **TypeScript** - Langage principal (ESM, target ES2022)
- **Mistral AI** - Modèle `mistral-small-latest` pour la génération (configurable)
- **Commander.js** - Parsing des arguments CLI
- **Biome.js** - Linting et formatting ultra-rapide
- **Jest** - Tests unitaires avec ts-jest (ESM)
- **Chalk** - Couleurs et style dans le terminal
- **dotenv** - Gestion des variables d'environnement
- **Node.js** - ≥ 18.0.0

## Changelog

Voir [CHANGELOG.md](CHANGELOG.md) pour l'historique détaillé des versions.

### Versions récentes

- **v0.7.0** - Centralisation de la configuration Mistral, journalisation des tokens
- **v0.6.0** - Ajustement du modèle Mistral
- **v0.5.0** - Amélioration de la gestion du changelog (marqueur d'insertion)
- **v0.4.0** - Ajout de `git-changelog`, tests Jest, fonction `wrapLines`
- **v0.3.0** - Affichage des fichiers staged, feedback visuel amélioré
- **v0.2.0** - Banner ASCII, API publique, confirmation interactive
- **v0.0.1** - Version initiale avec wrapper Git et CLI basique

## Licence

MIT - Voir [LICENSE](LICENSE) pour plus de détails.

## Auteur

Fabien Sanchez

## Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.
