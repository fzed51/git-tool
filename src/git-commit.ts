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
import chalk from "chalk";

async function main() {
  try {
    console.log(
      chalk.green.bold(
        [
          "  ▘▗             ▘▗",
          "▛▌▌▜▘▄▖▛▘▛▌▛▛▌▛▛▌▌▜▘",
          "▙▌▌▐▖  ▙▖▙▌▌▌▌▌▌▌▌▐▖",
          "▄▌",
        ].join("\n"),
      ),
    );

    // Afficher les fichiers dans le stage
    const git = new GitWrapper();
    const stagedFiles = await git.getStagedFiles();

    if (stagedFiles.length === 0) {
      console.log(chalk.yellow("\n⚠️  Aucun fichier dans le stage!"));
      console.log(
        "💡 Utilisez 'git add <fichiers>' pour ajouter des fichiers.\n",
      );
      process.exit(1);
    }

    console.log(chalk.blue.bold("\n📋 Fichiers dans le stage:"));
    for (const file of stagedFiles) {
      console.log(chalk.cyan(`   • ${file}`));
    }
    console.log();

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
