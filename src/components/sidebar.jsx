import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X, HandCoins, ListTodoIcon,SquareUserRound, ChartCandlestick, FileInput, FileOutput, Repeat, ArrowLeftRight, CircleUser, Vault, CircleSlash2, LogOut } from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  // Kurdish navigation items
  const navItems = [
    { name: "حساباتی قاسەکان", path: "/safe-partners", icon: HandCoins },
    { name: " حسابی کەسی", path: "/partner-report", icon: SquareUserRound },
    { name: "کریپتۆ", path: "/crypto-transactions", icon: ChartCandlestick },
    { name: "حەواڵەی هاتوو", path: "/incoming-money", icon: FileInput },
    { name: "حەواڵە کردن", path: "/outgoing-money", icon: FileOutput },
    { name: "ئاڵوگـۆڕ", path: "/exchange", icon: Repeat },
    { name: "گۆڕانکاری پارە", path: "/safe-transactions", icon: ArrowLeftRight },
    { name: "شەریکەکان", path: "/partners", icon: CircleUser },
    { name: "جۆری قاسە", path: "/safe-types", icon: Vault },
    { name: " قەرز", path: "/debts", icon: CircleSlash2 },
    { name: " داشبۆرد", path: "/dashboard", icon: ListTodoIcon },
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

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login"); // redirect to login page
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed md:hidden z-50 top-4 right-4 p-2 rounded-lg bg-white/10 backdrop-blur-lg border border-white/20 text-white"
        onClick={toggleSidebar}
        aria-label="کردنەوەی مێنوو"
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

      {/* Sidebar */}
      <div
        className={`fixed z-40 h-screen transition-all duration-300 ease-in-out
          ${isMobile ? (isOpen ? "w-82" : "w-0") : "w-82"}
          right-0
          ${!isMobile ? "md:translate-x-0" : ""}
          ${isMobile && !isOpen ? "translate-x-full" : "translate-x-0"}
        `}
      >
        <div
          className={`h-full p-4
            ${isMobile ? (isOpen ? "block" : "hidden") : "block"}
            ${!isMobile ? "md:block" : ""}
          `}
        >
          <div className="h-full rounded-e-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg overflow-hidden flex flex-col text-right">
            
            {/* Sidebar header */}
            <div className="p-6 border-b border-white/10">
              <h1 className="text-2xl font-bold text-white">نوسینگەی بڕوا</h1>
            </div>

            {/* Navigation items */}
            <nav className="p-4 flex-grow">
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.name} className="text-lg">
                    <NavLink
                      to={item.path}
                      onClick={() => isMobile && setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
                        ${isActive
                          ? "bg-white/20 text-white font-medium"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`
                      }
                    >
                      <item.icon size={22} className="text-cyan-500" />
                      <span>{item.name}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Logout button */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-400 hover:text-red-500 hover:bg-white/10 transition-all duration-300"
              >
                <LogOut size={22} />
                <span>چوونەدەرەوە</span> {/* "Logout" in Kurdish */}
              </button>
            </div>

            {/* Footer */}
            <div className="p-4 text-white/50 text-sm text-center">
              © 2025 کۆمپانیای بڕوا
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
