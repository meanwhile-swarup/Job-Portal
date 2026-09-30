import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { FaBars, FaTimes, FaBriefcase, FaSun, FaMoon } from "react-icons/fa";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Home", path: "/" },
    ...(user && user.user_metadata?.role === "company"
      ? [{ name: "Dashboard", path: "/company" }]
      : user
        ? [
            { name: "Applied Jobs", path: "/applied" },
            { name: "Saved Jobs", path: "/saved" },
          ]
        : []),
    ...(user ? [{ name: "Profile", path: "/profile" }] : []),
  ];

  const handleNavClick = (path) => {
    setIsOpen(false);
    if (path) navigate(path);
  };

  return (
    <>
      <nav className="h-[70px] bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 md:px-10 lg:px-16 sticky top-0 z-50 transition-colors duration-300">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-md shadow-violet-500/20">
            <FaBriefcase className="text-white text-sm" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Skill<span className="text-violet-600 dark:text-violet-400">Gig</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <ul className="flex items-center gap-6">
            {menuItems.map((item) => (
              <li key={item.name}>
                <a
                  onClick={(e) => { e.preventDefault(); handleNavClick(item.path); }}
                  href="#"
                  className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-200"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
            >
              {isDarkMode ? <FaSun className="text-base" /> : <FaMoon className="text-base" />}
            </button>

            {user && <NotificationBell />}

            {user ? (
              <>
                <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">{user?.user_metadata?.display_name || user?.email}</span>
                <button
                  onClick={logout}
                  className="rounded-lg px-5 py-2 bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all duration-200 cursor-pointer shadow-sm shadow-red-500/20"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  className="cursor-pointer text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 font-semibold transition-colors duration-200 text-sm px-3 py-2"
                  onClick={() => navigate("/auth")}
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/auth")}
                  className="rounded-lg px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-all duration-200 shadow-sm shadow-violet-500/30 cursor-pointer"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Action & Hamburger */}
        <div className="flex items-center gap-3 lg:hidden z-50">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
          >
            {isDarkMode ? <FaSun className="text-base" /> : <FaMoon className="text-base" />}
          </button>
          {user && <NotificationBell />}
          <div className="text-xl cursor-pointer text-slate-700 dark:text-slate-200" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl z-40 lg:hidden transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full pt-24 px-6 gap-4">
          <ul className="flex flex-col gap-2 text-base font-semibold">
            {menuItems.map((item) => (
              <li key={item.name}>
                <a
                  onClick={(e) => { e.preventDefault(); handleNavClick(item.path); }}
                  href="#"
                  className="block py-3 px-4 text-slate-700 dark:text-slate-200 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-slate-800 rounded-xl transition"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-2 flex flex-col gap-3">
            {user ? (
              <>
                <div className="text-slate-500 dark:text-slate-400 text-sm mb-1">
                  Logged in as: <span className="font-bold text-slate-800 dark:text-white">{user?.user_metadata?.display_name || user?.email}</span>
                </div>
                <button
                  onClick={() => { setIsOpen(false); logout(); }}
                  className="w-full text-center rounded-xl py-3 bg-red-500 text-white font-semibold hover:bg-red-600 transition text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavClick("/auth")}
                  className="w-full text-center rounded-xl py-3 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition text-sm"
                >
                  Login
                </button>
                <button
                  onClick={() => handleNavClick("/auth")}
                  className="w-full text-center rounded-xl py-3 bg-violet-600 text-white font-semibold hover:bg-violet-700 transition text-sm"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;