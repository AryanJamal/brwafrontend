import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/sidebar';
import Home from './pages/Home';
import Transactions from './pages/Transaction';
import SafeTypes from './pages/SafeTypes';
import { useEffect } from 'react';
import SafePartners from './pages/SafePartners';
import CryptoTransactions from './pages/CryptoTransactions';
import TransferxExchange from './pages/TransferExchange';
import IncomingMoney from './pages/IncomingMoney';
import OutgoingMoney from './pages/OutgoingMoney';
import SafeTransactions from './pages/SafeTransactions';
import Partners from './pages/Partners';
// Import other pages as needed

function App() {
  useEffect(() => {
    // Set document direction to RTL
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ku'; // Kurdish language code
    
    return () => {
      document.documentElement.dir = 'ltr'; // Reset on unmount if needed
    };
  }, []);
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-500 to-gray-400">
      <Sidebar />
      {/* Main content with proper margin */}
      <main className="md:mr-70 transition-all duration-300 p-4 md:p-8 min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/safe-types" element={<SafeTypes />} />
            <Route path="/safe-partners" element={<SafePartners />} />
            <Route path="/crypto-transactions" element={<CryptoTransactions />} />
            <Route path="/exchange" element={<TransferxExchange />} />
            <Route path="/incoming-money" element={<IncomingMoney />} />
            <Route path="/outgoing-money" element={<OutgoingMoney />} />
            <Route path="/safe-transactions" element={<SafeTransactions />} />
            <Route path="/partners" element={<Partners />} />
            {/* Add other routes here */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;