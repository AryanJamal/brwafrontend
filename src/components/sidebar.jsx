import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, Home, CreditCard, Vault, HandCoins, ChartCandlestick, Repeat, FileInput, FileOutput, ArrowLeftRight, CircleUser} from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Kurdish navigation items
  const navItems = [
    // { name: "سەرەکی", path: "/", icon: Home }, // "Home" in Kurdish
    // { name: "مامەڵەکان", path: "/transactions", icon: CreditCard }, // "Transactions" in Kurdish
    { name: "حساباتی قاسەکان", path: "/safe-partners", icon: HandCoins }, // "Transactions" in Kurdish
    { name: "کریپتۆ", path: "/crypto-transactions", icon: ChartCandlestick }, // "Transactions" in Kurdish
    { name: "حەواڵەی هاتوو" , path: "/incoming-money", icon: FileInput }, // "Transactions" in Kurdish
    { name: "حەواڵە کردن", path: "/outgoing-money", icon: FileOutput }, // "Transactions" in Kurdish
    { name: "ئاڵوگـۆڕ", path: "/exchange", icon: Repeat }, // "Transactions" in Kurdish
    { name: "دانانی پارە", path: "/safe-transactions", icon: ArrowLeftRight }, // "Transactions" in Kurdish
    { name: "شەریکەکان", path: "/partners", icon: CircleUser }, // "Transactions" in Kurdish
    { name: "جۆری قاسە", path: "/safe-types", icon: Vault }, // "Transactions" in Kurdish
    // Add more Kurdish items as needed
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768 && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile menu button - moved to right side for RTL */}
      <button
        className="fixed md:hidden z-50 top-4 right-4 p-2 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 text-white"
        onClick={toggleSidebar}
        aria-label="کردنەوەی مێنوو" // "Open menu" in Kurdish
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 ease-in-out"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* RTL Sidebar - positioned on right */}
      <div
        className={`fixed z-40 h-screen transition-all duration-300 ease-in-out
          ${isMobile ? (isOpen ? "w-82" : "w-0") : "w-82"}
          right-0 // Changed from default left positioning
          ${!isMobile ? "md:translate-x-0" : ""}
          ${isMobile && !isOpen ? "translate-x-full" : "translate-x-0"} // Changed direction
        `}
      >
        <div
          className={`h-full p-4
            ${isMobile ? (isOpen ? "block" : "hidden") : "block"}
            ${!isMobile ? "md:block" : ""}
          `}
        >
          {/* Glassmorphism container with RTL text */}
          <div className="h-full rounded-e-2xl rounded-s-none bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg overflow-hidden flex flex-col text-right"> {/* Changed to rounded-s-2xl and text-right */}
            
            {/* Sidebar header */}
            <div className="p-6 border-b border-white/10">
              <h1 className="text-2xl font-bold text-white">نوسینگەی بڕوا</h1> {/* "Your Logo" in Kurdish */}
            </div>

            {/* Navigation items with RTL alignment */}
            <nav className="p-4 flex-grow">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.name} className="text-lg">
                    <NavLink
                      to={item.path}
                      onClick={() => isMobile && setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
                        flex-row // Added for RTL icon positioning
                        ${
                          isActive
                            ? "bg-white/20 text-white font-medium"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`
                      }
                    >
                      <item.icon size={28} className="text-slate-900 stroke-slate-900" />
                      <span>{item.name}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
            
            {/* Footer with Kurdish text */}
            <div className="p-4 border-t border-white/10 text-white/50 text-sm">
              © 2025 کۆمپانیای ئێوە {/* "Your Company" in Kurdish */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;