import { CompanyInfo } from '../types/finance';
import { DEFAULT_COMPANIES, ALL_SUPPORTED_COMPANIES } from './config/companies';

// カラーパレットのプリセット（未登録銘柄用の自動割り当て）
const PALETTE = [
  '#0f62fe', // IBM Blue
  '#00a4ef', // MSFT Blue
  '#c74634', // Oracle Red
  '#f0ab00', // SAP Gold
  '#00a1e0', // Salesforce Cyan
  '#34a853', // Green
  '#ff9900', // Orange
  '#8a3ffc', // Purple
  '#0072c3', // Sky
  '#fa4d56', // Coral
  '#198038', // Dark Green
];

function generateColorFromSymbol(symbol: string): string {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
}

export class CompanyRegistry {
  private companies: Map<string, CompanyInfo> = new Map();

  constructor() {
    this.reset();
  }

  reset(): void {
    this.companies.clear();
    for (const comp of ALL_SUPPORTED_COMPANIES) {
      this.companies.set(comp.symbol.toUpperCase(), { ...comp });
    }
  }

  getCompany(symbol: string): CompanyInfo {
    const sym = symbol.toUpperCase().trim();
    const existing = this.companies.get(sym);
    if (existing) {
      return existing;
    }

    // 未知の企業の場合は動的に登録
    const newCompany: CompanyInfo = {
      symbol: sym,
      name: `${sym} Corp`,
      color: generateColorFromSymbol(sym),
      isPrimary: sym === 'IBM',
    };
    this.companies.set(sym, newCompany);
    return newCompany;
  }

  registerCompany(info: CompanyInfo): void {
    this.companies.set(info.symbol.toUpperCase().trim(), {
      ...info,
      symbol: info.symbol.toUpperCase().trim(),
    });
  }

  getDefaultCompanies(): CompanyInfo[] {
    return DEFAULT_COMPANIES.map((c) => this.getCompany(c.symbol));
  }

  getAllRegistered(): CompanyInfo[] {
    return Array.from(this.companies.values());
  }
}

export const companyRegistry = new CompanyRegistry();
