import React from 'react';
import ReactDOM from 'react-dom/client';
import ExpenseDashboard from './components/ExpenseDashboard';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ExpenseDashboard />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);