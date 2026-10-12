import { TimeRange, HistoricalPoint, MarketQuote } from '../../types/finance';
import { getCompanyBySymbol } from '../config/companies';

const BASE_PRICES: Record<string, { base: number; volatility: number }> = {
  IBM: { base: 218.5, volatility: 0.012 },
  MSFT: { base: 432.2, volatility: 0.015 },
  ORCL: { base: 172.8, volatility: 0.018 },
  SAP: { base: 234.1, volatility: 0.014 },
  CRM: { base: 295.6, volatility: 0.02 },
  GOOGL: { base: 182.4, volatility: 0.016 },
  AMZN: { base: 205.3, volatility: 0.017 },
  AAPL: { base: 236.7, volatility: 0.013 },
};

/**
 * 疑似乱数による決定論的またはリアルな価格生成
 */
function pseudoRandomWalk(base: number, volatility: number, count: number, seedOffset = 0): number[] {
  const result: number[] = [];
  let current = base;

  for (let i = 0; i < count; i++) {
    // 周期的な揺らぎ + ランダム要素
    const wave = Math.sin((i + seedOffset) / 3) * volatility * 0.5;
    const noise = (Math.random() - 0.48) * volatility;
    current = current * (1 + wave + noise);
    result.push(Number(current.toFixed(2)));
  }

  return result;
}

export function generateMockQuotes(symbols: string[]): MarketQuote[] {
  return symbols.map((symbol) => {
    const config = BASE_PRICES[symbol.toUpperCase()] || { base: 100, volatility: 0.015 };
    const compInfo = getCompanyBySymbol(symbol);
    
    // 前日終値からの変動
    const changeFactor = (Math.random() - 0.45) * 0.03;
    const price = Number((config.base * (1 + changeFactor)).toFixed(2));
    const change = Number((price - config.base).toFixed(2));
    const changePercent = Number(((change / config.base) * 100).toFixed(2));
    
    const high = Number((Math.max(price, config.base) * (1 + Math.random() * 0.008)).toFixed(2));
    const low = Number((Math.min(price, config.base) * (1 - Math.random() * 0.008)).toFixed(2));
    const open = Number((config.base * (1 + (Math.random() - 0.5) * 0.005)).toFixed(2));

    return {
      symbol: symbol.toUpperCase(),
      name: compInfo?.name || `${symbol.toUpperCase()} Inc.`,
      price,
      change,
      changePercent,
      open,
      high,
      low,
      volume: Math.floor(1000000 + Math.random() * 5000000),
      currency: 'USD',
      updatedAt: new Date().toISOString(),
    };
  });
}

export function generateMockHistory(symbol: string, range: TimeRange): HistoricalPoint[] {
  const sym = symbol.toUpperCase();
  const config = BASE_PRICES[sym] || { base: 100, volatility: 0.015 };
  const seed = sym.charCodeAt(0) + sym.charCodeAt(sym.length - 1);

  if (range === '1d') {
    // 当日: 9:30から16:00までの30分刻み (14ポイント)
    const times = [
      '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
      '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00'
    ];
    const prices = pseudoRandomWalk(config.base, config.volatility * 0.3, times.length, seed);

    return times.map((time, i) => ({
      timestamp: `2025-01-15T${time}:00Z`,
      dateLabel: time,
      close: prices[i],
      volume: Math.floor(50000 + Math.random() * 200000),
    }));
  }

  if (range === '7d') {
    // 過去7日間: 日次 (7ポイント)
    const days = ['Day -6', 'Day -5', 'Day -4', 'Day -3', 'Day -2', 'Yesterday', 'Today'];
    const prices = pseudoRandomWalk(config.base * 0.98, config.volatility * 0.8, days.length, seed);

    return days.map((day, i) => ({
      timestamp: `2025-01-${String(9 + i).padStart(2, '0')}`,
      dateLabel: day,
      close: prices[i],
      volume: Math.floor(1000000 + Math.random() * 3000000),
    }));
  }

  // 3mo (前四半期): 約12週分 (12ポイント)
  const weeks = Array.from({ length: 12 }, (_, i) => `W${i + 1}`);
  const prices = pseudoRandomWalk(config.base * 0.92, config.volatility * 1.2, weeks.length, seed);

  return weeks.map((week, i) => ({
    timestamp: `2024-Q4-W${i + 1}`,
    dateLabel: week,
    close: prices[i],
    volume: Math.floor(5000000 + Math.random() * 10000000),
  }));
}
