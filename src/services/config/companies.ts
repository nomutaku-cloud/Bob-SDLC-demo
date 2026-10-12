import { CompanyInfo } from '../../types/finance';

export const DEFAULT_COMPANIES: CompanyInfo[] = [
  { symbol: 'IBM', name: 'International Business Machines', color: '#0f62fe', isPrimary: true },
  { symbol: 'MSFT', name: 'Microsoft Corporation', color: '#00a4ef' },
  { symbol: 'ORCL', name: 'Oracle Corporation', color: '#c74634' },
  { symbol: 'SAP', name: 'SAP SE', color: '#f0ab00' },
  { symbol: 'CRM', name: 'Salesforce, Inc.', color: '#00a1e0' },
];

export const ALL_SUPPORTED_COMPANIES: CompanyInfo[] = [
  ...DEFAULT_COMPANIES,
  { symbol: 'GOOGL', name: 'Alphabet Inc.', color: '#34a853' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', color: '#ff9900' },
  { symbol: 'AAPL', name: 'Apple Inc.', color: '#555555' },
];

export function getCompanyBySymbol(symbol: string): CompanyInfo | undefined {
  return ALL_SUPPORTED_COMPANIES.find(
    (c) => c.symbol.toUpperCase() === symbol.toUpperCase()
  );
}
