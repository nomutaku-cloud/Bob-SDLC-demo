import { SymbolValidationReason } from '../types/finance';

// 銘柄コードの形式: 英字で始まり、英数字・ドット・ハイフンで最大10文字（例: IBM, BRK.B, RDS-A）
const TICKER_PATTERN = /^[A-Z][A-Z0-9.-]{0,9}$/;

export function normalizeTicker(input: string): string {
  return input.trim().toUpperCase();
}

export function isValidTickerFormat(symbol: string): boolean {
  return TICKER_PATTERN.test(symbol);
}

export function getSymbolErrorMessage(symbol: string, reason: SymbolValidationReason): string {
  switch (reason) {
    case 'format':
      return symbol
        ? `「${symbol}」は銘柄コードの形式として正しくありません。英字で始まる1〜10文字（英数字・「.」「-」）で入力してください。`
        : '銘柄コードを入力してください。';
    case 'not_found':
      return `銘柄「${symbol}」のデータが見つかりません。銘柄コードをご確認ください。`;
    case 'unsupported':
      return `銘柄「${symbol}」は現在サポートされていません。候補リストの企業から選択してください。`;
  }
}
