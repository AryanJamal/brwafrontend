import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Sidebar from './components/sidebar';
import Transactions from './pages/Transaction';
import SafeTypes from './pages/SafeTypes';
import SafePartners from './pages/SafePartners';
import CryptoTransactions from './pages/CryptoTransactions';
import TransferxExchange from './pages/TransferExchange';
import IncomingMoney from './pages/IncomingMoney';
import OutgoingMoney from './pages/OutgoingMoney';
import SafeTransactions from './pages/SafeTransactions';
import Partners from './pages/Partners';
import Debts from './pages/Debts';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PartnerReport from './pages/PartnerReport';

function App() {
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      setAuth(true);
    }
    setLoading(false);
  }, []);

  if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );
  return (
    <Router>
      {auth ? (
        <div className="min-h-screen bg-gradient-to-br from-gray-500 to-gray-400">
          <Sidebar />
          <main className="md:mr-70 transition-all duration-300 p-4 md:p-8 min-h-screen">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/safe-partners" element={<SafePartners />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/safe-types" element={<SafeTypes />} />
              <Route path="/crypto-transactions" element={<CryptoTransactions />} />
              <Route path="/exchange" element={<TransferxExchange />} />
              <Route path="/incoming-money" element={<IncomingMoney />} />
              <Route path="/outgoing-money" element={<OutgoingMoney />} />
              <Route path="/safe-transactions" element={<SafeTransactions />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/partner-report" element={<PartnerReport />} />
              <Route path="/debts" element={<Debts />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login setAuth={setAuth} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
