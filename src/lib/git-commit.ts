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

Réponds uniquement avec le message de commit, sans explication supplémentaire.`;

  const response = await mistral.chat.complete({
    model: "devstral-medium-latest",
	temperature:0.2,
    messages: [
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
    console.info("─".repeat(30)+"\n");
  }

  const content = response.choices?.[0]?.message?.content;
  const commitMessage = typeof content === "string" ? content.trim() : "";

  if (!commitMessage) {
    throw new Error("Impossible de générer un message de commit.");
  }

  return commitMessage;
}
