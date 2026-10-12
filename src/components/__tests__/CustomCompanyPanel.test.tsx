import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CustomCompanyPanel } from '../dashboard/CustomCompanyPanel';
import { DashboardPage } from '../dashboard/DashboardPage';
import {
  setFinanceService,
  getFinanceService,
  MockFinanceService,
} from '../../services/financeService';
import { IFinanceService } from '../../types/finance';

describe('CustomCompanyPanel', () => {
  let originalService: IFinanceService;

  beforeEach(() => {
    originalService = getFinanceService();
    setFinanceService(new MockFinanceService(0));
  });

  afterEach(() => {
    setFinanceService(originalService);
  });

  const submit = (value: string) => {
    fireEvent.change(screen.getByLabelText('比較する銘柄コード'), { target: { value } });
    fireEvent.click(screen.getByRole('button', { name: /表示/ }));
  };

  it('初期状態では案内メッセージが表示されること', () => {
    render(<CustomCompanyPanel range="7d" />);
    expect(screen.getByText(/IBMとの比較チャートが表示されます/)).toBeInTheDocument();
  });

  it('有効な銘柄を指定するとIBMとの比較チャートが表示されること', async () => {
    render(<CustomCompanyPanel range="7d" />);
    submit('googl');
    await waitFor(() =>
      expect(screen.getByText(/GOOGL \(Alphabet Inc\.\) と IBM の比較/)).toBeInTheDocument()
    );
    await waitFor(() => expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument());
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });

  it('取得中はローディング表示がされること', async () => {
    setFinanceService(new MockFinanceService(50));
    render(<CustomCompanyPanel range="7d" />);
    submit('AAPL');
    expect(await screen.findByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('形式不正な銘柄ではエラーメッセージが表示されること', async () => {
    render(<CustomCompanyPanel range="7d" />);
    submit('12$');
    expect(await screen.findByText(/銘柄コードの形式として正しくありません/)).toBeInTheDocument();
  });

  it('未対応の銘柄ではエラーメッセージが表示されること', async () => {
    render(<CustomCompanyPanel range="7d" />);
    submit('ZZZZ');
    expect(await screen.findByText(/銘柄「ZZZZ」のデータが見つかりません/)).toBeInTheDocument();
  });

  it('クリアボタンで初期状態に戻ること', async () => {
    render(<CustomCompanyPanel range="7d" />);
    submit('ZZZZ');
    await screen.findByTestId('error-message');
    fireEvent.click(screen.getByRole('button', { name: /クリア/ }));
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    expect(screen.getByText(/IBMとの比較チャートが表示されます/)).toBeInTheDocument();
  });
});

describe('DashboardPage との統合', () => {
  let originalService: IFinanceService;

  beforeEach(() => {
    originalService = getFinanceService();
    setFinanceService(new MockFinanceService(0));
  });

  afterEach(() => {
    setFinanceService(originalService);
  });

  it('選択企業のチャート追加後も既存ダッシュボードの追跡企業数が変わらないこと', async () => {
    render(<DashboardPage />);
    expect(await screen.findByText('5 Companies Tracked')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('比較する銘柄コード'), { target: { value: 'GOOGL' } });
    fireEvent.click(screen.getByRole('button', { name: /表示/ }));

    await waitFor(() =>
      expect(screen.getByText(/GOOGL \(Alphabet Inc\.\) と IBM の比較/)).toBeInTheDocument()
    );
    expect(screen.getByText('5 Companies Tracked')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove GOOGL' })).not.toBeInTheDocument();
  });

  it('無効な銘柄のエラーが既存ダッシュボードに影響しないこと', async () => {
    render(<DashboardPage />);
    await screen.findByText('5 Companies Tracked');

    fireEvent.change(screen.getByLabelText('比較する銘柄コード'), { target: { value: 'ZZZZ' } });
    fireEvent.click(screen.getByRole('button', { name: /表示/ }));

    expect(await screen.findByText(/銘柄「ZZZZ」のデータが見つかりません/)).toBeInTheDocument();
    expect(screen.getAllByTestId('error-message')).toHaveLength(1);
    expect(screen.getByText('5 Companies Tracked')).toBeInTheDocument();
  });
});
