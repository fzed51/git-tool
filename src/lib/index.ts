/**
 * Git Tool - API publique
 * Exporte les fonctionnalités principales du package
 */

export { generateCommitMessage } from "./git-commit.js";
export { git, GitWrapper } from "./git-wrapper.js";
export type { GitExecOptions } from "./git-wrapper.js";
