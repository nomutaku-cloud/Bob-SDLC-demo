import { describe, it, expect, beforeEach } from 'vitest';
import { CompanyRegistry } from '../companyRegistry';

describe('CompanyRegistry', () => {
  let registry: CompanyRegistry;

  beforeEach(() => {
    registry = new CompanyRegistry();
  });

  it('IBMを含むデフォルト追跡企業を取得できること', () => {
    const defaults = registry.getDefaultCompanies();
    expect(defaults.length).toBeGreaterThanOrEqual(5);
    const ibm = defaults.find((c) => c.symbol === 'IBM');
    expect(ibm).toBeDefined();
    expect(ibm?.isPrimary).toBe(true);
    expect(ibm?.color).toBe('#0f62fe');
  });

  it('未登録の企業シンボルが指定された場合、自動でカラーと名前を付与して動的登録すること', () => {
    const newComp = registry.getCompany('NVDA');
    expect(newComp.symbol).toBe('NVDA');
    expect(newComp.name).toBe('NVDA Corp');
    expect(newComp.color).toMatch(/^#[0-9a-fA-F]{6}$/);

    // 再度取得した場合に同一のオブジェクト/カラーが返ること
    const sameComp = registry.getCompany('nvda');
    expect(sameComp.color).toBe(newComp.color);
  });

  it('明示的な企業情報の追加登録ができること', () => {
    registry.registerCompany({
      symbol: 'TSLA',
      name: 'Tesla, Inc.',
      color: '#e82127',
    });

    const tesla = registry.getCompany('TSLA');
    expect(tesla.name).toBe('Tesla, Inc.');
    expect(tesla.color).toBe('#e82127');
  });
});
