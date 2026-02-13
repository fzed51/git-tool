/**
 * Module Mistral AI
 * Centralise la configuration et les appels à l'API Mistral
 */

import "dotenv/config";
import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

const mistralModel = process.env.MISTRAL_MODEL || "mistral-small-latest";

interface ChatOptions {
  system: string;
  prompt: string;
  temperature?: number;
}

/**
 * Affiche les statistiques d'utilisation des tokens dans la console.
 */
function logTokenUsage(usage: {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}): void {
  const W = 27;
  const hr = "─".repeat(W);
  const row = (text: string) => `│${text.padEnd(W)}│`;
  const label = (name: string, value: number) =>
    row(`  ${name.padEnd(14)} ${value.toString().padStart(6)}`);

  console.info("");
  console.info(`┌${hr}┐`);
  console.info(row("  📊 Tokens utilisés"));
  console.info(`├${hr}┤`);
  if (usage.promptTokens !== undefined)
    console.info(label("Prompt", usage.promptTokens));
  if (usage.completionTokens !== undefined)
    console.info(label("Completion", usage.completionTokens));
  if (usage.totalTokens !== undefined) {
    console.info(`├${hr}┤`);
    console.info(label("Total", usage.totalTokens));
  }
  console.info(`└${hr}┘`);
  console.info("");
}

/**
 * Envoie un message au modèle Mistral et retourne la réponse textuelle.
 *
 * @param options - Les options du chat (system prompt, user prompt, température)
 * @returns Le contenu textuel de la réponse
 * @throws Si la réponse est vide ou invalide
 */
export async function chat(options: ChatOptions): Promise<string> {
  const { system, prompt, temperature = 0.3 } = options;

  const response = await mistral.chat.complete({
    model: mistralModel,
    temperature,
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
  });

  if (response.usage) {
    logTokenUsage(response.usage);
  }

  const content = response.choices?.[0]?.message?.content;
  const text = typeof content === "string" ? content.trim() : "";

  if (!text) {
    throw new Error("Réponse vide du modèle Mistral.");
  }

  return text;
}
