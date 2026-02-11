/**
 * Git Commit Message Generator
 * Génère automatiquement un message de commit à partir des fichiers staged
 */

import "dotenv/config";
import { Mistral } from "@mistralai/mistralai";
import { git } from "./git-wrapper.js";

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

/**
 * Formate un texte en ajoutant des retours à la ligne pour éviter
 * les lignes trop longues, sans couper les mots.
 *
 * @param text - Le texte à formater
 * @param maxLength - Longueur maximale par ligne (défaut: 72)
 * @returns Le texte formaté avec retours à la ligne
 */
export function wrapLines(text: string, maxLength = 72): string {
  const lines = text.split("\n");
  const wrappedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Ligne vide : conserver telle quelle
    if (line.trim() === "") {
      wrappedLines.push("");
      continue;
    }

    // Si la ligne est déjà courte, la conserver
    if (line.length <= maxLength) {
      wrappedLines.push(line);
      continue;
    }

    // Détecter l'indentation : espaces + éventuelle puce
    // ( -, *, +, • ) ou numéro de liste (ex: "1." ou "2)") suivi d'un espace
    const listIndentMatch = line.match(/^(\s*(?:[-*+•]|(?:\d+[\.\)]))\s+)/);
    const firstIndent = listIndentMatch
      ? listIndentMatch[0]
      : line.match(/^\s*/)?.[0] || "";
    const content = line.substring(firstIndent.length);
    const nextIndent = " ".repeat(firstIndent.length);
    // Découper la ligne en respectant les mots
    const words = content.split(/(\s+)/); // Garder les espaces
    let currentLine = firstIndent;

    for (const word of words) {
      const testLine = currentLine + word;

      if (testLine.length <= maxLength) {
        currentLine = testLine;
      } else {
        // Si le mot seul est plus long que maxLength
        if (currentLine.trim() === "" && word.trim().length > maxLength) {
          wrappedLines.push(nextIndent + word.trim());
          currentLine = nextIndent;
        } else {
          // Ajouter la ligne actuelle et commencer une nouvelle
          if (currentLine.trim() !== "") {
            wrappedLines.push(currentLine.trimEnd());
          }
          currentLine = nextIndent + word.trimStart();
        }
      }
    }
    if (currentLine.trim() !== "") {
      wrappedLines.push(currentLine.trimEnd());
    }
  }

  return wrappedLines.join("\n");
}

export async function generateCommitMessage(): Promise<string> {
  const stagedFiles = await git.getStagedFiles();

  if (stagedFiles.length === 0) {
    throw new Error(
      "Aucun fichier staged. Utilisez 'git add' pour ajouter des fichiers.",
    );
  }

  const diff = await git.getStagedDiff();

  if (!diff.trim()) {
    throw new Error("Aucune modification trouvée dans les fichiers staged.");
  }
  const system =
    "Tu es un assistant de développement et un expert en Git et en bonnes pratiques de versioning.";
  const prompt = `Analyse les changements git suivants et génère un message de commit concis et descriptif.

Fichiers modifiés:
${stagedFiles.join("\n")}

Différences:
${diff}

Génère un message de commit qui suit les conventions:
- Une ligne de résumé de 50 caractères maximum
- Si nécessaire, une ligne vide suivie d'une description plus détaillée
- Utilise l'impératif présent (ex: "feat", "fix", "test", "doc", "chore")
- Soit clair et précis sur ce qui a changé et pourquoi

Réponds uniquement avec le message de commit, sans explication supplémentaire, sans mise en forme markdown.`;

  const response = await mistral.chat.complete({
    model: "mistral-small-latest",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: system,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // Log token usage
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
  const commitMessage = typeof content === "string" ? content.trim() : "";

  if (!commitMessage) {
    throw new Error("Impossible de générer un message de commit.");
  }

  return wrapLines(commitMessage, 72);
}
