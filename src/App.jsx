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

function App() {
  const [auth, setAuth] = useState(false);

  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ku';

    // Check token in localStorage
    const token = localStorage.getItem("access");
    if (token) setAuth(true);

    return () => {
      document.documentElement.dir = 'ltr';
    };
  }, []);

  return (
    <Router>
      {auth ? (
        <div className="min-h-screen bg-gradient-to-br from-gray-500 to-gray-400">
          <Sidebar />
          <main className="md:mr-70 transition-all duration-300 p-4 md:p-8 min-h-screen">
            <Routes>
              <Route path="/" element={<SafePartners />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/safe-types" element={<SafeTypes />} />
              <Route path="/safe-partners" element={<SafePartners />} />
              <Route path="/crypto-transactions" element={<CryptoTransactions />} />
              <Route path="/exchange" element={<TransferxExchange />} />
              <Route path="/incoming-money" element={<IncomingMoney />} />
              <Route path="/outgoing-money" element={<OutgoingMoney />} />
              <Route path="/safe-transactions" element={<SafeTransactions />} />
              <Route path="/partners" element={<Partners />} />
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
