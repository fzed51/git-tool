#!/usr/bin/env node

/**
 * CLI pour générer automatiquement des messages de commit avec IA
 * Usage: git-commit
 */

import "dotenv/config";
import { stdin as input, stdout as output } from "node:process";
import * as readline from "node:readline/promises";
import { generateCommitMessage } from "./lib/git-commit.js";
import { GitWrapper } from "./lib/git-wrapper.js";

async function main() {
  try {
    console.log("🤖 Génération du message de commit...\n");

    const message = await generateCommitMessage();

    console.log("✅ Message de commit généré:\n");
    console.log("─".repeat(50));
    console.log(message);
    console.log("─".repeat(50));

    // Demander à l'utilisateur s'il veut exécuter le commit
    const rl = readline.createInterface({ input, output });
    const answer = await rl.question(
      "\n❓ Voulez-vous exécuter ce commit maintenant ? (o/n) ",
    );
    rl.close();

    if (answer.toLowerCase() === "o" || answer.toLowerCase() === "y") {
      console.log("\n⏳ Exécution du commit...");
      const git = new GitWrapper();
      await git.commit(message);
      console.log("✅ Commit effectué avec succès !");
    } else {
      console.log("\n💡 Pour commiter avec ce message:");
      console.log(`   git commit -m "${message.split("\n")[0]}"`);
    }
  } catch (error) {
    console.error("❌ Erreur:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
