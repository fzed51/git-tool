#!/usr/bin/env node

/**
 * CLI pour générer automatiquement des messages de commit avec IA
 * Usage: git-commit
 */

import "dotenv/config";
import { generateCommitMessage } from "./lib/git-commit";

async function main() {
	try {
		console.log("🤖 Génération du message de commit...\n");

		const message = await generateCommitMessage();

		console.log("✅ Message de commit généré:\n");
		console.log("─".repeat(50));
		console.log(message);
		console.log("─".repeat(50));
		console.log("\n💡 Pour commiter avec ce message:");
		console.log(`   git commit -m "${message.split("\n")[0]}"`);
	} catch (error) {
		console.error("❌ Erreur:", error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

main();
