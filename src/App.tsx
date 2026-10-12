import React from 'react';
import { DashboardPage } from './components/dashboard/DashboardPage';
import './styles/main.css';

export const App: React.FC = () => {
  return (
    <div className="app-container">
      <DashboardPage />
    </div>
  );
};

export default App;
