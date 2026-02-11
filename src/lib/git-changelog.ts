/**
 * Git Changelog Generator
 * Génère automatiquement un changelog à partir de l'historique des commits
 */

import "dotenv/config";
import { Mistral } from "@mistralai/mistralai";
import { git } from "./git-wrapper.js";

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

/**
 * Récupère le dernier tag de version.
 * Si aucun tag n'existe, retourne une chaîne vide.
 */
export async function getLastVersionTag(): Promise<string> {
  return await git.getLastVersionTag();
}

/**
 * Récupère les commits depuis le dernier tag de version.
 * Si aucun tag n'est trouvé, récupère les N derniers commits.
 */
export async function getCommitsSinceLastVersion(
  tag?: string,
): Promise<string[]> {
  const lastTag = tag ?? (await git.getLastVersionTag());

  if (!lastTag) {
    // Pas de tag trouvé, récupérer les 50 derniers commits
    const output = await git.getLog({ count: 50, format: "%h %s" });
    return output
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  }

  return await git.getLogSince(lastTag);
}

/**
 * Génère un changelog formaté en Markdown à partir d'une liste de commits
 * en utilisant l'IA pour les catégoriser et les rédiger.
 */
export async function generateChangelog(
  version: string,
  commits: string[],
): Promise<string> {
  if (commits.length === 0) {
    throw new Error("Aucun commit trouvé pour générer le changelog.");
  }

  // date du jour au format YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

  const system =
    "Tu es un assistant de développement expert en rédaction de changelogs clairs et professionnels.";

  const prompt = `Voici une liste de commits Git. Génère un changelog au format Markdown pour la version ${version}.

Commits :
${commits.join("\n")}

Règles :
- Regroupe les commits par catégorie (Added, Changed, Fixed, Removed, etc.) en utilisant les conventions Keep a Changelog
- Chaque entrée doit être concise et compréhensible par un utilisateur final
- Utilise le format "## [${version}] - ${today}" comme titre avec la date du jour
- Ne mets pas de blocs de code markdown autour du résultat
- Réponds uniquement avec le changelog, sans explication supplémentaire`;

  const response = await mistral.chat.complete({
    model: "mistral-small-latest",
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
  });

  if (response.usage) {
    console.info("\nTokens utilisés:");
    console.info("─".repeat(30));
    if (response.usage.promptTokens !== undefined)
      console.info("promptTokens:", response.usage.promptTokens);
    if (response.usage.completionTokens !== undefined)
      console.info("completionTokens:", response.usage.completionTokens);
    if (response.usage.totalTokens !== undefined)
      console.info("totalTokens:", response.usage.totalTokens);
    console.info("─".repeat(30) + "\n");
  }

  const content = response.choices?.[0]?.message?.content;
  const changelog = typeof content === "string" ? content.trim() : "";

  if (!changelog) {
    throw new Error("Impossible de générer le changelog.");
  }

  return changelog;
}

/**
 * Met à jour le fichier CHANGELOG.md en ajoutant le nouveau contenu
 * à l'emplacement du marqueur "--->" s'il existe.
 */
export async function updateChangelogFile(
  newEntry: string,
  filePath = "CHANGELOG.md",
): Promise<string> {
  const { readFile, writeFile } = await import("node:fs/promises");
  const { resolve } = await import("node:path");

  const fullPath = resolve(filePath);
  let existingContent = "";

  try {
    existingContent = await readFile(fullPath, "utf-8");
  } catch {
    // Fichier inexistant, on le crée
    existingContent = "# Changelog\n";
  }

  // Insérer après le marqueur "--->" s'il existe
  const markerIndex = existingContent.indexOf("--->");
  let updatedContent: string;

  if (markerIndex !== -1) {
    const afterMarker = existingContent.substring(markerIndex + 4);
    updatedContent = `${existingContent.substring(0, markerIndex + 4)}\n\n${newEntry}\n${afterMarker}`;
  } else {
    const titleMatch = existingContent.match(/^# .+\n/);
    if (titleMatch) {
      const afterTitle = existingContent.substring(titleMatch[0].length);
      updatedContent = `${titleMatch[0]}\n${newEntry}\n${afterTitle}`;
    } else {
      updatedContent = `# Changelog\n\n${newEntry}\n\n${existingContent}`;
    }
  }

  await writeFile(fullPath, updatedContent, "utf-8");
  return fullPath;
}
