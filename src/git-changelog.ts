import { Command } from "commander";
import chalk from "chalk";
import { stdin as input, stdout as output } from "node:process";
import * as readline from "node:readline/promises";
import {
  getLastVersionTag,
  getCommitsSinceLastVersion,
  generateChangelog,
  updateChangelogFile,
} from "./lib/git-changelog.js";
import { GitWrapper } from "./lib/git-wrapper.js";

const program = new Command();

program
  .name("git-changelog")
  .description("Génère un changelog à partir de l'historique Git avec l'IA")
  .argument("<version>", "La prochaine version (ex: 1.0.0)")
  .option("--from <tag>", "Tag de départ (défaut: dernier tag de version)")
  .option("--no-commit", "Ne pas commiter automatiquement le CHANGELOG.md")
  .action(
    async (version: string, options: { from?: string; commit: boolean }) => {
      try {
        console.log(
          chalk.green.bold(
            [
              "  ▘▗     ▌         ▜",
              "▛▌▌▜▘▄▖▛▘▛▌▀▌▛▌▛▌█▌▐ ▛▌▛▌",
              "▙▌▌▐▖  ▙▖▌▌█▌▌▌▙▌▙▖▐▖▙▌▙▌",
              "▄▌             ▄▌      ▄▌",
            ].join("\n"),
          ),
        );

        // Récupérer le tag de départ
        const fromTag = options.from ?? (await getLastVersionTag());
        if (fromTag) {
          console.log(chalk.blue(`\n📌 Dernier tag de version: ${fromTag}`));
        } else {
          console.log(
            chalk.yellow(
              "\n⚠️  Aucun tag de version trouvé, utilisation des derniers commits.",
            ),
          );
        }

        // Récupérer les commits
        const commits = await getCommitsSinceLastVersion(fromTag || undefined);
        if (commits.length === 0) {
          console.log(
            chalk.yellow(
              "\n⚠️  Aucun commit trouvé depuis la dernière version.",
            ),
          );
          process.exit(0);
        }

        console.log(chalk.blue(`\n📋 ${commits.length} commit(s) trouvé(s):`));
        for (const commit of commits) {
          console.log(chalk.cyan(`   • ${commit}`));
        }

        // Générer le changelog
        console.log("\n🤖 Génération du changelog...\n");
        const changelog = await generateChangelog(version, commits);

        console.log("✅ Changelog généré:\n");
        console.log("─".repeat(50));
        console.log(changelog);
        console.log("─".repeat(50));

        // Demander validation
        const rl = readline.createInterface({ input, output });
        const answer = await rl.question(
          "\n❓ Mettre à jour le CHANGELOG.md ? (o/n) ",
        );
        rl.close();

        if (answer.toLowerCase() === "o" || answer.toLowerCase() === "y") {
          const filePath = await updateChangelogFile(changelog);
          console.log(chalk.green(`\n✅ ${filePath} mis à jour !`));

          if (options.commit) {
            const git = new GitWrapper();
            await git.add(["CHANGELOG.md"]);
            await git.commit(`docs: update CHANGELOG.md for v${version}`);
            console.log(chalk.green("✅ Commit effectué !"));
          }
        } else {
          console.log("\n💡 Changelog non appliqué.");
        }
      } catch (error) {
        console.error(
          "❌ Erreur:",
          error instanceof Error ? error.message : error,
        );
        process.exit(1);
      }
    },
  );

program.parse();
