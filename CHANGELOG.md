# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

--->

## [0.4.0] - 2023-11-10

### Added
- Added `git-changelog` command for AI-powered changelog generation
- Added methods to retrieve Git tags
- Added `wrapLines` function for commit message formatting
- Added Jest configuration and test scripts
- Added comprehensive tool documentation in the README

### Changed
- Improved commit message generation
- Clarified commit message instructions in the documentation
- Added `commander` dependency for CLI improvements

### Fixed
- Preserved bullet points and numbered lists in line wrapping

## [0.3.0] - 2026-02-11

### Added
- Display of staged files before commit message generation
- Visual feedback showing which files will be committed with colored output
- Warning when no files are staged, preventing empty commits

### Changed
- Updated dev script to use tsx for direct execution without build step

## [0.2.0] - 2026-02-11

### Added
- ASCII art banner with chalk for enhanced CLI experience
- Public API with exported functions (`generateCommitMessage`, `git`, `GitWrapper`)
- MIT license
- Interactive confirmation before committing
- Token usage logging in git commit generation
- Mistral AI integration for commit message generation
- Environment variable support with dotenv
- README documentation with configuration instructions

### Fixed
- Set temperature to 0.2 for more deterministic AI responses
- Improved JSON and TypeScript file formatting

### Changed
- Updated configuration files for improved settings and dependencies
- Updated module resolution settings

## [0.0.1] - Initial Development

### Added
- Initial project setup
- Git wrapper functionality
- Command-line interface for git operations
