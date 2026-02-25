#!/usr/bin/env node

/**
 * CLI pour créer des branches Git formatées
 * Usage: git-branch [options]
 */

import { Command } from "commander";
import chalk from "chalk";
import { stdin as input, stdout as output } from "node:process";
import * as readline from "node:readline/promises";
import {
  BRANCH_TYPES,
  type BranchType,
  validateRef,
  formatBranchName,
  detectBaseBranch,
  resolveFromBranch,
  createBranchFromBase,
  slugify,
} from "./lib/git-branch.js";

const program = new Command();

program
  .name("git-branch")
  .description(
    "Crée une nouvelle branche Git formatée <type>/<ref>-<name> à partir d'une branche de base à jour",
  )
  .option("-t, --type <type>", `Type de branche (${BRANCH_TYPES.join(", ")})`)
  .option("-r, --ref <ref>", "Référence courte (ex: COM-123, #42)")
  .option("-n, --name <name>", "Nom descriptif de la branche")
  .option(
    "--from <branch>",
    "Branche d'origine (défaut: develop/dev/main/master). Accepte des noms laxistes.",
  )
  .option("--noname", "Ne pas demander de nom pour la branche")
  .action(
    async (options: {
      type?: string;
      ref?: string;
      name?: string;
      from?: string;
      noname?: boolean;
    }) => {
      const rl = readline.createInterface({ input, output });

      try {
        console.log(
          chalk.green.bold(
            [
              "  ▘▗   ▌         ▌",
              "▛▌▌▜▘▄▖▛▌▛▘▀▌▛▌▛▘▛▌",
              "▙▌▌▐▖  ▙▌▌ █▌▌▌▙▖▌▌",
              "▄▌",
            ].join("\n"),
          ),
        );

        // ── 1. Résoudre la branche de base ──
        let baseBranch: string;
        if (options.from) {
          baseBranch = await resolveFromBranch(options.from);
          console.log(
            chalk.blue(`\n📌 Branche d'origine: ${chalk.bold(baseBranch)}`),
          );
        } else {
          baseBranch = await detectBaseBranch();
          console.log(
            chalk.blue(
              `\n📌 Branche de base détectée: ${chalk.bold(baseBranch)}`,
            ),
          );
        }

        // ── 2. Déterminer le type ──
        let branchType: BranchType;
        if (options.type) {
          const t = options.type.toLowerCase();
          if (!BRANCH_TYPES.includes(t as BranchType)) {
            console.log(
              chalk.red(
                `\n❌ Type invalide: "${options.type}". Types autorisés: ${BRANCH_TYPES.join(", ")}`,
              ),
            );
            process.exit(1);
          }
          branchType = t as BranchType;
        } else {
          console.log(chalk.blue("\n📋 Types disponibles:"));
          for (let i = 0; i < BRANCH_TYPES.length; i++) {
            console.log(chalk.cyan(`   ${i + 1}. ${BRANCH_TYPES[i]}`));
          }
          const typeAnswer = await rl.question(
            chalk.yellow(
              `\n❓ Choisissez un type [1-${BRANCH_TYPES.length}]: `,
            ),
          );
          const typeIndex = Number.parseInt(typeAnswer, 10) - 1;
          if (typeIndex < 0 || typeIndex >= BRANCH_TYPES.length) {
            console.log(chalk.red("\n❌ Choix invalide."));
            process.exit(1);
          }
          branchType = BRANCH_TYPES[typeIndex];
        }
        console.log(chalk.green(`   ✔ Type: ${branchType}`));

        // ── 3. Déterminer la référence ──
        let ref: string;
        if (options.ref) {
          ref = options.ref;
        } else {
          ref = await rl.question(
            chalk.yellow("\n❓ Référence (ex: COM-123, #42, @ticket) : "),
          );
        }

        const refError = validateRef(ref);
        if (refError) {
          console.log(chalk.red(`\n❌ ${refError}`));
          process.exit(1);
        }
        console.log(chalk.green(`   ✔ Réf: ${ref}`));

        // ── 4. Déterminer le nom ──
        let name: string | undefined;
        if (options.noname) {
          name = undefined;
        } else if (options.name) {
          name = options.name;
        } else {
          const nameAnswer = await rl.question(
            chalk.yellow("\n❓ Nom descriptif (laisser vide pour aucun) : "),
          );
          name = nameAnswer.trim() || undefined;
        }

        if (name) {
          name = slugify(name);
          console.log(chalk.green(`   ✔ Nom: ${name}`));
        }

        // ── 5. Construire et confirmer ──
        const branchName = formatBranchName(branchType, ref, name);

        console.log(chalk.blue.bold("\n🌿 Branche à créer:"));
        console.log("─".repeat(50));
        console.log(chalk.bold(`   ${branchName}`));
        console.log(chalk.dim(`   depuis ${baseBranch}`));
        console.log("─".repeat(50));

        const confirm = await rl.question(
          chalk.yellow("\n❓ Créer cette branche ? (o/n) "),
        );
        rl.close();

        if (confirm.toLowerCase() === "o" || confirm.toLowerCase() === "y") {
          console.log("\n⏳ Création de la branche...");
          await createBranchFromBase(branchName, baseBranch);
          console.log(
            chalk.green.bold(
              `\n✅ Branche "${branchName}" créée avec succès !`,
            ),
          );
          console.log(chalk.dim(`   Vous êtes maintenant sur ${branchName}`));
        } else {
          console.log("\n💡 Création annulée.");
        }
      } catch (error) {
        rl.close();
        console.error(
          "❌ Erreur:",
          error instanceof Error ? error.message : error,
        );
        process.exit(1);
      }
    },
  );

program.parse();
