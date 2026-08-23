import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaBars, FaTimes, FaBriefcase } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Directory", path: "/people" },
    ...(user && user.user_metadata?.role === "company"
      ? [{ name: "Dashboard", path: "/company" }]
      : user
        ? [{ name: "Applied Jobs", path: "/applied" }]
        : []),
    ...(user ? [{ name: "Profile", path: "/profile" }] : []),
  ];

  const handleNavClick = (path) => {
    setIsOpen(false);
    if (path) navigate(path);
  };

  return (
    <>
      <nav className="h-[70px] bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 lg:px-16 sticky top-0 z-50">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
            <FaBriefcase className="text-white text-sm" />
          </div>
          <span className="text-xl font-extrabold text-slate-900 tracking-tight">
            Skill<span className="text-violet-600">Gig</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-600">
          <ul className="flex items-center gap-6">
            {menuItems.map((item) => (
              <li key={item.name}>
                <a
                  onClick={(e) => { e.preventDefault(); handleNavClick(item.path); }}
                  href="#"
                  className="hover:text-violet-600 transition-colors duration-200"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-slate-500 text-sm font-medium">{user?.user_metadata?.display_name || user?.email}</span>
                <button
                  onClick={logout}
                  className="rounded-lg px-5 py-2 bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all duration-200 cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  className="cursor-pointer text-slate-600 hover:text-violet-600 font-semibold transition-colors duration-200 text-sm px-3 py-2"
                  onClick={() => navigate("/auth")}
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("/auth")}
                  className="rounded-lg px-5 py-2 bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-all duration-200 shadow-sm shadow-violet-500/30 cursor-pointer"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Hamburger */}
        <div className="lg:hidden text-xl cursor-pointer text-slate-700 z-50" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>
      </nav>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-40 lg:hidden transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full pt-24 px-6 gap-4">
          <ul className="flex flex-col gap-2 text-base font-semibold">
            {menuItems.map((item) => (
              <li key={item.name}>
                <a
                  onClick={(e) => { e.preventDefault(); handleNavClick(item.path); }}
                  href="#"
                  className="block py-3 px-4 text-slate-700 hover:text-violet-600 hover:bg-violet-50 rounded-xl transition"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>

          <div className="border-t border-slate-100 pt-6 mt-2 flex flex-col gap-3">
            {user ? (
              <>
                <div className="text-slate-500 text-sm mb-1">
                  Logged in as: <span className="font-bold text-slate-800">{user?.user_metadata?.display_name || user?.email}</span>
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
                  className="w-full text-center rounded-xl py-3 border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition text-sm"
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