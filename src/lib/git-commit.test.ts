/**
 * Tests unitaires pour la fonction wrapLines
 */

import { describe, it, expect } from "@jest/globals";
import { wrapLines } from "./git-commit.js";

describe("wrapLines", () => {
  describe("Ligne unique courte", () => {
    it("devrait conserver une ligne courte inchangée", () => {
      const input = "feat: add new feature";
      const result = wrapLines(input, 72);
      expect(result).toBe(input);
    });

    it("devrait conserver une ligne de 72 caractères exactement", () => {
      const input = "a".repeat(72);
      const result = wrapLines(input, 72);
      expect(result).toBe(input);
    });
  });

  describe("Ligne unique trop longue", () => {
    it("devrait découper une ligne longue sans indentation", () => {
      const input =
        "This is a very long line that exceeds the maximum length and should be wrapped into multiple lines";
      const result = wrapLines(input, 72);
      const lines = result.split("\n");

      // Vérifier que toutes les lignes respectent la limite
      lines.forEach((line) => {
        expect(line.length).toBeLessThanOrEqual(72);
      });

      // Vérifier qu'il y a plusieurs lignes
      expect(lines.length).toBeGreaterThan(1);

      // Vérifier que le contenu est préservé (sans les espaces multiples)
      expect(result.replace(/\n/g, " ")).toBe(input);
    });

    it("devrait découper sans couper les mots", () => {
      const input = "This is a very long line that should be wrapped without breaking words in the middle";
      const result = wrapLines(input, 40);
      const lines = result.split("\n");

      // Vérifier qu'aucune ligne ne se termine ou commence en milieu de mot
      lines.forEach((line, index) => {
        if (index < lines.length - 1) {
          // Pas de tirets en fin de ligne (sauf si c'était dans le texte original)
          expect(line.trim()).not.toMatch(/\w-$/);
        }
      });
    });
  });

  describe("Lignes multiples", () => {
    it("devrait traiter correctement un message multi-lignes", () => {
      const input = `feat: add authentication

This commit adds OAuth2 authentication support with Google provider.
It includes token refresh mechanism and secure storage implementation.`;

      const result = wrapLines(input, 72);
      const lines = result.split("\n");

      // Vérifier que toutes les lignes respectent la limite
      lines.forEach((line) => {
        expect(line.length).toBeLessThanOrEqual(72);
      });

      // La première ligne doit rester intacte (titre)
      expect(lines[0]).toBe("feat: add authentication");

      // La deuxième ligne doit être vide
      expect(lines[1]).toBe("");
    });

    it("devrait préserver les lignes vides", () => {
      const input = "Ligne 1\n\nLigne 3\n\nLigne 5";
      const result = wrapLines(input, 72);
      const lines = result.split("\n");

      expect(lines.length).toBe(5);
      expect(lines[1]).toBe("");
      expect(lines[3]).toBe("");
    });
  });

  describe("Indentation", () => {
    it("devrait préserver l'indentation lors du découpage", () => {
      const input =
        "  This is an indented line that is very long and should be wrapped while preserving the indentation";
      const result = wrapLines(input, 50);
      const lines = result.split("\n");

      // Toutes les lignes doivent commencer par 2 espaces
      lines.forEach((line) => {
        if (line.trim() !== "") {
          expect(line.startsWith("  ")).toBe(true);
        }
      });
    });

    it("devrait gérer plusieurs niveaux d'indentation", () => {
      const input = `Pas d'indentation
  Indentation 2
    Indentation 4
      Indentation 6`;

      const result = wrapLines(input, 72);
      const lines = result.split("\n");

      expect(lines[0]).toMatch(/^Pas/);
      expect(lines[1]).toMatch(/^ {2}Indentation 2/);
      expect(lines[2]).toMatch(/^ {4}Indentation 4/);
      expect(lines[3]).toMatch(/^ {6}Indentation 6/);
    });
  });

  describe("Cas limites", () => {
    it("devrait gérer une chaîne vide", () => {
      const result = wrapLines("", 72);
      expect(result).toBe("");
    });

    it("devrait gérer un seul mot très long", () => {
      const longWord = "a".repeat(100);
      const result = wrapLines(longWord, 72);
      // Le mot long devrait rester sur une seule ligne même s'il dépasse
      expect(result).toBe(longWord);
    });

    it("devrait gérer des espaces multiples", () => {
      const input = "word1    word2    word3 that needs to be wrapped because it is too long";
      const result = wrapLines(input, 40);
      const lines = result.split("\n");

      lines.forEach((line) => {
        expect(line.length).toBeLessThanOrEqual(40);
      });
    });

    it("devrait gérer maxLength très petit", () => {
      const input = "This is a test";
      const result = wrapLines(input, 5);
      const lines = result.split("\n");

      // Devrait découper autant que possible
      expect(lines.length).toBeGreaterThan(1);
    });

    it("devrait gérer une ligne avec seulement des espaces", () => {
      const input = "Ligne 1\n    \nLigne 3";
      const result = wrapLines(input, 72);
      const lines = result.split("\n");

      expect(lines.length).toBe(3);
      expect(lines[1]).toBe("");
    });
  });

  describe("Message de commit réaliste", () => {
    it("devrait formater correctement un message de commit git standard", () => {
      const input = `feat(auth): implement OAuth2 authentication with Google

Add OAuth2 authentication flow supporting Google login. This implementation includes the following features:
- Token generation and validation using JWT
- Automatic token refresh mechanism to maintain user sessions
- Secure credential storage using encrypted cookies
- Comprehensive error handling for various authentication failure scenarios`;

      const result = wrapLines(input, 72);
      const lines = result.split("\n");

      // Vérifier que toutes les lignes respectent la limite
      lines.forEach((line) => {
        expect(line.length).toBeLessThanOrEqual(72);
      });

      // Le titre devrait rester intact
      expect(lines[0]).toContain("feat(auth)");

      // Devrait y avoir une ligne vide après le titre
      expect(lines[1]).toBe("");
    });
  });

  describe("Options de maxLength", () => {
    it("devrait utiliser 72 par défaut", () => {
      const input = "a ".repeat(40);
      const result = wrapLines(input);
      const lines = result.split("\n");

      expect(lines.length).toBeGreaterThan(1);
      lines.forEach((line) => {
        expect(line.length).toBeLessThanOrEqual(72);
      });
    });

    it("devrait accepter une limite personnalisée", () => {
      const input =
        "This is a test that should be wrapped at 30 characters maximum";
      const result = wrapLines(input, 30);
      const lines = result.split("\n");

      lines.forEach((line) => {
        expect(line.length).toBeLessThanOrEqual(30);
      });
    });
  });
});
