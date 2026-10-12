import { IFinanceService, TimeRange } from '../types/finance';
import { YahooFinanceService } from './yahooFinanceService';
import { MockFinanceService } from './mockFinanceService';

// デフォルトでは耐障害性（フォールバック機能付き）を備えたYahooFinanceServiceを使用
let activeService: IFinanceService = new YahooFinanceService();

export function setFinanceService(service: IFinanceService): void {
  activeService = service;
}

export function getFinanceService(): IFinanceService {
  return activeService;
}

export const financeService = {
  validateSymbol: (symbol: string) => activeService.validateSymbol(symbol),
  getTrackedCompanies: () => activeService.getTrackedCompanies(),
  getQuote: (symbol: string) => activeService.getQuote(symbol),
  getQuotes: (symbols: string[]) => activeService.getQuotes(symbols),
  getHistory: (symbol: string, range: TimeRange) => activeService.getHistory(symbol, range),
  getComparisonHistory: (symbols: string[], range: TimeRange) =>
    activeService.getComparisonHistory(symbols, range),
  clearCache: () => {
    if ('clearCache' in activeService && typeof (activeService as any).clearCache === 'function') {
      (activeService as any).clearCache();
    }
  },
};

export { YahooFinanceService, MockFinanceService };
