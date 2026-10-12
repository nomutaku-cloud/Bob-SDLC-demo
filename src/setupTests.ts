import '@testing-library/jest-dom';

// ResizeObserverのモック（Rechartsやレスポンシブコンポーネント用）
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
