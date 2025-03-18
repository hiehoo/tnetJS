import { ServiceType } from '../types';

/**
 * Service to generate trading statistics for displaying in the bot
 */
class StatsService {
  /**
   * Generate EA bot statistics
   */
  getEABotStats(): { [key: string]: string | number } {
    return {
      winRate: '87%',
      monthlyAvgReturn: '42%',
      bestMonth: '73%',
      worstMonth: '28%',
      drawdown: '9.3%',
      tradesPerDay: '5-8',
      lastMonthReturn: '47%',
      profitRatio: '1:3.2',
      successfulUsers: '98%'
    };
  }

  /**
   * Generate signal statistics
   */
  getSignalStats(): { [key: string]: string | number } {
    return {
      winRate: '92%',
      avgWeeklySignals: 32,
      avgMonthlyReturn: '38%',
      verifiedWinRate: '91%',
      majorPairs: '100%',
      minorPairs: '87%',
      exoticPairs: '88%',
      tradeAccuracy: '94%',
      profitRatio: '1:3.5'
    };
  }

  /**
   * Generate VIP statistics
   */
  getVIPStats(): { [key: string]: string | number } {
    return {
      winRate: '95%',
      exclusiveSignals: '100%',
      customStrategies: 'YES',
      personalSupport: '24/7',
      avgMonthlyReturn: '58%',
      investmentGrowth: '310%',
      profitRatio: '1:4.1',
      riskManagement: 'Advanced',
      liveSessions: 'Weekly'
    };
  }

  /**
   * Generate X10 challenge statistics
   */
  getX10ChallengeStats(): { [key: string]: string | number } {
    return {
      successRate: '67%',
      avgCompletionTime: '27 days',
      bestResult: '1432%',
      worstResult: '780%',
      riskLevel: 'High',
      requiredStartingBalance: '$1,000',
      signalsProvided: 'Daily',
      communitySupport: 'YES',
      liveTradingSessions: 'Daily'
    };
  }

  /**
   * Generate copytrade statistics
   */
  getCopytradeStats(): { [key: string]: string | number } {
    return {
      winRate: '85%',
      avgMonthlyReturn: '32%',
      passiveIncome: 'YES',
      requiredStartingBalance: '$500',
      riskLevel: 'Low-Medium',
      withdrawalsAllowed: 'Anytime',
      performanceFee: '0%',
      minInvestmentTime: '30 days',
      supportedBrokers: '30+'
    };
  }

  /**
   * Get stats for the specified service
   */
  getServiceStats(service: ServiceType): { [key: string]: string | number } {
    switch (service) {
      case ServiceType.SIGNAL:
        return this.getSignalStats();
      case ServiceType.VIP:
        return this.getVIPStats();
      case ServiceType.X10_CHALLENGE:
        return this.getX10ChallengeStats();
      case ServiceType.COPYTRADE:
        return this.getCopytradeStats();
      default:
        return {};
    }
  }

  /**
   * Generate a formatted statistics message
   */
  formatStatsMessage(service: ServiceType): string {
    const stats = this.getServiceStats(service);
    let message = `📊 *IMPRESSIVE PERFORMANCE STATS* 📊\n\n`;

    for (const [key, value] of Object.entries(stats)) {
      const formattedKey = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace(/Avg/g, 'Average')
        .replace(/Vip/g, 'VIP');

      message += `🔹 *${formattedKey}:* ${value}\n`;
    }

    message += '\n💰 *These results are why our users keep coming back!* 💰';
    return message;
  }
}

// Singleton instance
export const statsService = new StatsService(); 