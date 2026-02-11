/**
 * Git Wrapper Module
 * Centralise toutes les interactions avec Git via des commandes shell
 */

import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

/**
 * Options pour l'exécution des commandes git
 */
export interface GitExecOptions {
  cwd?: string;
}

/**
 * Classe wrapper pour les commandes Git
 */
export class GitWrapper {
  private options: GitExecOptions;

  constructor(options: GitExecOptions = {}) {
    this.options = options;
  }

  /**
   * Exécute une commande git
   */
  private async exec(command: string): Promise<string> {
    try {
      const { stdout } = await execAsync(`git ${command}`, {
        cwd: this.options.cwd,
      });
      return stdout.trim();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erreur git: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Récupère les fichiers staged (dans l'index)
   */
  async getStagedFiles(): Promise<string[]> {
    const output = await this.exec("diff --cached --name-only");
    return output.split("\n").filter((file) => file.length > 0);
  }

  /**
   * Récupère le diff des fichiers staged
   */
  async getStagedDiff(): Promise<string> {
    return await this.exec("diff --cached");
  }

  /**
   * Récupère le statut du dépôt
   */
  async getStatus(): Promise<string> {
    return await this.exec("status --porcelain");
  }

  /**
   * Récupère la branche courante
   */
  async getCurrentBranch(): Promise<string> {
    return await this.exec("rev-parse --abbrev-ref HEAD");
  }

  /**
   * Ajoute des fichiers à l'index
   */
  async add(files: string[] | string): Promise<void> {
    const fileList = Array.isArray(files) ? files.join(" ") : files;
    await this.exec(`add ${fileList}`);
  }

  /**
   * Effectue un commit
   */
  async commit(message: string): Promise<void> {
    // Échapper les guillemets dans le message
    const escapedMessage = message.replace(/"/g, '\\"');
    await this.exec(`commit -m "${escapedMessage}"`);
  }

  /**
   * Récupère l'historique des commits
   */
  async getLog(
    options: { count?: number; format?: string; oneline?: boolean } = {},
  ): Promise<string> {
    let command = "log";

    if (options.count) {
      command += ` -${options.count}`;
    }

    if (options.oneline) {
      command += " --oneline";
    } else if (options.format) {
      command += ` --format="${options.format}"`;
    }

    return await this.exec(command);
  }

  /**
   * Récupère les fichiers modifiés non staged
   */
  async getModifiedFiles(): Promise<string[]> {
    const output = await this.exec("diff --name-only");
    return output.split("\n").filter((file) => file.length > 0);
  }

  /**
   * Récupère les fichiers non trackés
   */
  async getUntrackedFiles(): Promise<string[]> {
    const output = await this.exec("ls-files --others --exclude-standard");
    return output.split("\n").filter((file) => file.length > 0);
  }

  /**
   * Vérifie si le répertoire est un dépôt git
   */
  async isGitRepository(): Promise<boolean> {
    try {
      await this.exec("rev-parse --git-dir");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Récupère le remote URL
   */
  async getRemoteUrl(remote = "origin"): Promise<string> {
    return await this.exec(`remote get-url ${remote}`);
  }

  /**
   * Récupère le dernier commit
   */
  async getLastCommit(): Promise<{
    hash: string;
    message: string;
    author: string;
    date: string;
  }> {
    const hash = await this.exec("log -1 --format=%H");
    const message = await this.exec("log -1 --format=%s");
    const author = await this.exec("log -1 --format=%an");
    const date = await this.exec("log -1 --format=%ad");

    return { hash, message, author, date };
  }

  /**
   * Reset des fichiers staged
   */
  async reset(files?: string[] | string): Promise<void> {
    if (files) {
      const fileList = Array.isArray(files) ? files.join(" ") : files;
      await this.exec(`reset ${fileList}`);
    } else {
      await this.exec("reset");
    }
  }

  /**
   * Récupère le diff entre deux commits ou branches
   */
  async getDiff(from?: string, to?: string): Promise<string> {
    let command = "diff";
    if (from) {
      command += ` ${from}`;
      if (to) {
        command += ` ${to}`;
      }
    }
    return await this.exec(command);
  }

  /**
   * Vérifie s'il y a des changements non commités
   */
  async hasUncommittedChanges(): Promise<boolean> {
    const status = await this.getStatus();
    return status.length > 0;
  }

  /**
   * Récupère le dernié tag
   */
  async getLastTag(): Promise<string> {
    return await this.exec("describe --tags --abrev=0");
  }

  /**
   * Récupère le dernier tag de version suivant le pattern vMAJOR.MINOR.PATCH (ex: v1.2.3)
   */
  async getLastVersionTag(): Promise<string> {
    const output = await this.exec(
      'tag --list "v[0-9]*.[0-9]*.[0-9]*" --sort=-v:refname',
    );
    const tags = output
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
    return tags.length > 0 ? tags[0] : "";
  }
}

/**
 * Instance par défaut du wrapper git
 */
export const git = new GitWrapper();
