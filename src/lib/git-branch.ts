/**
 * Git Branch Creator
 * Crée des branches Git formatées à partir d'une branche de base à jour
 */

import { git } from "./git-wrapper.js";

/** Types de branches autorisés */
export const BRANCH_TYPES = ["feat", "fix", "epic", "release"] as const;
export type BranchType = (typeof BRANCH_TYPES)[number];

/** Branches de base par ordre de priorité */
const BASE_BRANCH_PRIORITY = ["develop", "dev", "main", "master"];

/**
 * Slugifie un texte : supprime les accents, remplace les espaces par des underscores,
 * supprime les caractères non compatibles avec les noms de branches git.
 */
export function slugify(text: string): string {
  return (
    text
      // Décomposer les caractères accentués (NFD) puis retirer les diacritiques
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // Minuscules
      .toLowerCase()
      // Espaces → underscores
      .replace(/\s+/g, "_")
      // Supprimer les caractères interdits dans les noms de branches git
      // Autorisés : alphanumériques, -, _, ., /, #, @
      .replace(/[^a-z0-9\-_./#@]/g, "")
      // Supprimer les doubles points consécutifs (..)
      .replace(/\.{2,}/g, ".")
      // Supprimer les séquences @{
      .replace(/@\{/g, "@")
      // Ne pas terminer par .lock
      .replace(/\.lock$/, "")
      // Supprimer les underscores/tirets en début et fin
      .replace(/^[-_]+|[-_]+$/g, "")
  );
}

/**
 * Valide une référence de branche (courte, < 10 caractères).
 */
export function validateRef(ref: string): string | null {
  if (!ref || ref.trim().length === 0) {
    return "La référence ne peut pas être vide.";
  }
  if (ref.length > 10) {
    return `La référence est trop longue (${ref.length} caractères, max 10).`;
  }
  // Vérifier les caractères interdits dans git
  if (/[\s~^:?*\[\]\\]/.test(ref)) {
    return "La référence contient des caractères interdits (espaces, ~, ^, :, ?, *, [, ], \\).";
  }
  if (/\.{2}/.test(ref)) {
    return 'La référence ne peut pas contenir "..".';
  }
  if (ref === "@") {
    return 'La référence ne peut pas être "@" seul.';
  }
  if (/@\{/.test(ref)) {
    return 'La référence ne peut pas contenir "@{".';
  }
  return null;
}

/**
 * Formate le nom complet de la branche : <type>/<ref>-<name> ou <type>/<ref>
 */
export function formatBranchName(
  type: BranchType,
  ref: string,
  name?: string,
): string {
  const sluggedRef = slugify(ref);
  if (!name || name.trim().length === 0) {
    return `${type}/${sluggedRef}`;
  }
  const sluggedName = slugify(name);
  return `${type}/${sluggedRef}-${sluggedName}`;
}

/**
 * Détecte la branche de base disponible par ordre de priorité :
 * develop > dev > main > master
 */
export async function detectBaseBranch(): Promise<string> {
  const branches = await git.getLocalBranches();

  for (const candidate of BASE_BRANCH_PRIORITY) {
    if (branches.includes(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    "Aucune branche de base trouvée (develop, dev, main, master).",
  );
}

/**
 * Résout un nom de branche laxiste vers une branche locale existante.
 *
 * Exemples :
 * - "dev" → "develop" (si develop existe et pas dev)
 * - "COM-123" → "epic/COM-123-super_feature" (match partiel)
 * - "develop" → "develop" (match exact)
 */
export async function resolveFromBranch(input: string): Promise<string> {
  const branches = await git.getLocalBranches();

  // 1. Match exact
  if (branches.includes(input)) {
    return input;
  }

  // 2. Alias courants
  const aliases: Record<string, string[]> = {
    dev: ["develop", "dev"],
    develop: ["develop", "dev"],
    main: ["main", "master"],
    master: ["master", "main"],
  };

  const lowered = input.toLowerCase();
  if (aliases[lowered]) {
    for (const alias of aliases[lowered]) {
      if (branches.includes(alias)) {
        return alias;
      }
    }
  }

  // 3. Match partiel — la branche contient l'input (ex: "COM-123" → "epic/COM-123-feature")
  const partialMatches = branches.filter((b) =>
    b.toLowerCase().includes(lowered),
  );
  if (partialMatches.length === 1) {
    return partialMatches[0];
  }
  if (partialMatches.length > 1) {
    // Préférer un match en fin de chemin (après le /)
    const afterSlash = partialMatches.filter((b) => {
      const parts = b.split("/");
      return parts[parts.length - 1].toLowerCase().startsWith(lowered);
    });
    if (afterSlash.length === 1) {
      return afterSlash[0];
    }
    throw new Error(
      `Plusieurs branches correspondent à "${input}" :\n${partialMatches.map((b) => `  - ${b}`).join("\n")}\nPrécisez le nom complet.`,
    );
  }

  throw new Error(`Aucune branche trouvée correspondant à "${input}".`);
}

/**
 * Crée une nouvelle branche à partir d'une branche de base à jour.
 *
 * @param branchName - Le nom complet de la branche à créer
 * @param baseBranch - La branche de base depuis laquelle créer
 * @returns Le nom de la branche créée
 */
export async function createBranchFromBase(
  branchName: string,
  baseBranch: string,
): Promise<string> {
  // Vérifier que la branche n'existe pas déjà
  if (await git.branchExists(branchName)) {
    throw new Error(`La branche "${branchName}" existe déjà.`);
  }

  // Se placer sur la branche de base
  await git.checkout(baseBranch);

  // Mettre à jour la branche de base
  try {
    await git.pull();
  } catch {
    // Le pull peut échouer si pas de remote configuré, on continue
    console.warn(
      "⚠️  Impossible de mettre à jour la branche de base (pas de remote ?).",
    );
  }

  // Créer la nouvelle branche
  await git.createBranch(branchName);

  return branchName;
}
