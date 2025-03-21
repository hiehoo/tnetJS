import { EntryPoint } from "../types";

/**
 * Utility class for helper functions
 */
export class Helpers {
  /**
   * Extract entry point from a message
   * Format: /start source_name
   * Example: /start facebook_ads
   */
  static getEntryPointFromMessage(message: string): EntryPoint {
    // Default entry point
    let entryPoint = EntryPoint.DEFAULT;

    return entryPoint;
  }

  /**
   * Parse callback data from inline buttons
   * Format: action:param (e.g., "service:ea_bot" or "ea:results")
   */
  static parseCallbackData(data: string): { action: string; param: string } {
    const [action, param] = data.split(":");
    return { action, param };
  }

  /**
   * Get a random number between min and max
   */
  static getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Get a random boolean with the given probability
   * @param probability Probability of returning true (0-1)
   */
  static getRandomBoolean(probability: number): boolean {
    return Math.random() < probability;
  }

  /**
   * Format currency number
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Format percentage
   */
  static formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  /**
   * Sanitize input to prevent injection attacks
   */
  static sanitizeInput(input: string): string {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /**
   * Generate a unique ID (used for campaign IDs, etc.)
   */
  static idGenerator(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }

  /**
   * Get remaining spots message with urgency
   */
  static getRemainingSpotsMessage(spots: number): string {
    if (spots <= 3) {
      return `⚠️ *URGENT: ONLY ${spots} SPOTS REMAINING!* ⚠️`;
    } else if (spots <= 10) {
      return `🔥 *Only ${spots} spots left at this price!* 🔥`;
    } else {
      return `⏱️ *Limited availability: ${spots} spots left* ⏱️`;
    }
  }

  /**
   * Get a "time running out" message with random urgency
   */
  static getTimeRunningOutMessage(): string {
    const messages = [
      "⏰ *OFFER ENDING SOON!* ⏰",
      "⚠️ *Last chance before price increase!* ⚠️",
      "🔥 *This week only - Don't miss out!* 🔥",
      "⏱️ *Limited time offer - Act now!* ⏱️",
    ];

    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  }
}
