import { describe, it, expect } from 'vitest';
import {
  normalizeTicker,
  isValidTickerFormat,
  getSymbolErrorMessage,
} from '../symbolValidation';

describe('symbolValidation', () => {
  it('入力値をトリムして大文字に正規化すること', () => {
    expect(normalizeTicker('  googl ')).toBe('GOOGL');
  });

  it('正しい形式の銘柄コードを有効と判定すること', () => {
    expect(isValidTickerFormat('IBM')).toBe(true);
    expect(isValidTickerFormat('BRK.B')).toBe(true);
    expect(isValidTickerFormat('RDS-A')).toBe(true);
  });

  it('不正な形式の銘柄コードを無効と判定すること', () => {
    expect(isValidTickerFormat('')).toBe(false);
    expect(isValidTickerFormat('1ABC')).toBe(false);
    expect(isValidTickerFormat('AB$C')).toBe(false);
    expect(isValidTickerFormat('ABCDEFGHIJK')).toBe(false);
  });

  it('理由ごとに分かりやすいエラーメッセージを返すこと', () => {
    expect(getSymbolErrorMessage('', 'format')).toContain('入力してください');
    expect(getSymbolErrorMessage('AB$', 'format')).toContain('形式');
    expect(getSymbolErrorMessage('ZZZZ', 'not_found')).toContain('見つかりません');
    expect(getSymbolErrorMessage('ZZZZ', 'unsupported')).toContain('サポートされていません');
  });
});
