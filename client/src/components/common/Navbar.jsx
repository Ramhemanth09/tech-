import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Search,
  MapPin,
  ShoppingCart,
  Heart,
  Sparkles,
  Menu,
  X,
  ChevronDown,
  Laptop,
  Camera,
  Gamepad2,
  ShieldCheck,
  User,
  LogOut,
  PlusCircle,
  Calendar,
} from 'lucide-react';

export function Navbar() {
  const { user, logout, shortlistCount } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchCategory, setSearchCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCategory) params.set('category', searchCategory);
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    navigate(`/marketplace?${params.toString()}`);
  };

  return (
    <header className="sticky top-0 z-40 shadow-md">
      {/* Top Primary Amazon-style Bar */}
      <div className="bg-[#131921] text-white px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3 md:gap-5">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex items-center gap-1.5 text-white no-underline shrink-0 group hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-amber-500 to-[#febd69] text-slate-950 flex items-center justify-center font-black shadow">
            <Laptop className="w-4 h-4 text-slate-950" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-base sm:text-lg font-black tracking-tight text-white flex items-center">
              TechCompanion<span className="text-[#febd69]">.in</span>
            </span>
            <span className="text-[10px] text-slate-300 font-semibold tracking-wider uppercase">
              Verified Preowned Tech
            </span>
          </div>
        </Link>

        {/* Deliver to Pin location */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white cursor-pointer p-1 rounded hover:border hover:border-slate-500 transition-all">
          <MapPin className="w-4 h-4 text-[#febd69] shrink-0" />
          <div className="leading-tight">
            <div className="text-[10px] text-slate-400">Deliver to</div>
            <div className="font-bold text-white text-xs">Bangalore 560001</div>
          </div>
        </div>

        {/* Center Amazon Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-2xl flex items-center rounded-md overflow-hidden bg-white shadow-inner focus-within:ring-2 focus-within:ring-amber-500"
        >
          {/* Category Dropdown */}
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="hidden sm:block bg-[#f3f3f3] text-slate-700 text-xs px-2.5 py-2 border-r border-slate-300 focus:outline-none hover:bg-slate-200 cursor-pointer font-medium"
          >
            <option value="">All Tech</option>
            <option value="laptop">Laptops</option>
            <option value="camera">Cameras</option>
            <option value="gaming_device">Gaming</option>
          </select>

          {/* Search Input */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search TechCompanion for laptops, cameras, gaming devices..."
            className="flex-1 px-3 py-2 text-xs text-slate-900 bg-white focus:outline-none placeholder:text-slate-400"
          />

          {/* Search Button */}
          <button
            type="submit"
            className="bg-[#febd69] hover:bg-[#f3a847] text-slate-950 px-4 py-2 flex items-center justify-center transition-colors font-bold"
            title="Search"
          >
            <Search className="w-4 h-4 text-slate-900" />
          </button>
        </form>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 text-xs">
          {/* User Sign In / Account */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to={
                  user.role === 'seller'
                    ? '/seller/dashboard'
                    : user.role === 'moderator'
                    ? '/moderator/dashboard'
                    : '/buyer/profile'
                }
                className="hover:border hover:border-slate-500 p-1.5 rounded transition-all text-left hidden sm:block"
              >
                <div className="text-[10px] text-slate-400 leading-tight">
                  Hello, {user.name.split(' ')[0]}
                </div>
                <div className="font-bold text-white text-xs flex items-center gap-1">
                  <span>{user.role === 'buyer' ? 'Account & Lists' : user.role === 'seller' ? 'Seller Console' : 'Mod Queue'}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-400 rounded transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hover:border hover:border-slate-500 p-1.5 rounded transition-all text-left"
            >
              <div className="text-[10px] text-slate-300 leading-tight">Hello, Sign in</div>
              <div className="font-bold text-white text-xs flex items-center gap-1">
                <span>Account & Lists</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </Link>
          )}

          {/* Viewings / Orders */}
          {user?.role === 'buyer' && (
            <Link
              to="/buyer/viewings"
              className="hidden md:block hover:border hover:border-slate-500 p-1.5 rounded transition-all text-left"
            >
              <div className="text-[10px] text-slate-300 leading-tight">Returns</div>
              <div className="font-bold text-white text-xs">& Viewings</div>
            </Link>
          )}

          {/* Cart / Shortlist with counter badge */}
          <Link
            to={user?.role === 'buyer' ? '/buyer/shortlist' : '/marketplace'}
            className="flex items-center gap-1.5 hover:border hover:border-slate-500 p-1.5 rounded transition-all relative"
            title="Shortlist / Cart"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-white" />
              {shortlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#febd69] text-slate-950 font-black text-[11px] px-1.5 py-0.2 rounded-full shadow">
                  {shortlistCount}
                </span>
              )}
            </div>
            <span className="font-bold text-white text-xs hidden sm:inline">Shortlist</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Amazon Sub-Navbar Strip */}
      <div className="bg-[#232f3e] text-white text-xs font-semibold px-3 sm:px-5 py-2 flex items-center gap-5 sm:gap-6 overflow-x-auto border-t border-slate-700/60 scrollbar-none">
        <Link
          to="/marketplace"
          className="flex items-center gap-1.5 hover:text-[#febd69] transition-colors shrink-0"
        >
          <Menu className="w-4 h-4" />
          <span>All Departments</span>
        </Link>

        <Link
          to="/marketplace?category=laptop"
          className="hover:text-[#febd69] transition-colors shrink-0 flex items-center gap-1"
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Laptops & MacBooks</span>
        </Link>

        <Link
          to="/marketplace?category=camera"
          className="hover:text-[#febd69] transition-colors shrink-0 flex items-center gap-1"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Cameras & Optics</span>
        </Link>

        <Link
          to="/marketplace?category=gaming_device"
          className="hover:text-[#febd69] transition-colors shrink-0 flex items-center gap-1"
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Gaming Consoles</span>
        </Link>

        {/* AI Comparison Tool Highlight */}
        <Link
          to="/compare"
          className="flex items-center gap-1.5 text-[#febd69] hover:underline font-bold shrink-0 bg-slate-800/80 px-2.5 py-0.5 rounded border border-amber-400/40"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#febd69]" />
          <span>AI Spec & Trade-Off Comparison</span>
        </Link>

        <Link
          to="/marketplace?sort=price_asc"
          className="hover:text-[#febd69] transition-colors shrink-0"
        >
          Today's Verified Deals
        </Link>

        {user?.role === 'seller' ? (
          <Link
            to="/seller/create-listing"
            className="text-emerald-400 hover:text-emerald-300 font-bold shrink-0 flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>List Device for Sale</span>
          </Link>
        ) : (
          <Link
            to="/register"
            className="hover:text-[#febd69] transition-colors shrink-0"
          >
            Sell on TechCompanion
          </Link>
        )}

        <div className="ml-auto hidden xl:flex items-center gap-1.5 text-slate-300 text-[11px] font-normal shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% Verified Hardware Diagnostics & Manuals</span>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#232f3e] text-white p-4 space-y-3 border-t border-slate-700">
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 hover:text-[#febd69]"
          >
            All Marketplace Listings
          </Link>
          <Link
            to="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 text-[#febd69] font-bold"
          >
            AI Comparison Agent
          </Link>
          <Link
            to="/marketplace?category=laptop"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 hover:text-[#febd69]"
          >
            Laptops & MacBooks
          </Link>
          <Link
            to="/marketplace?category=camera"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 hover:text-[#febd69]"
          >
            Cameras & Optics
          </Link>
          <Link
            to="/marketplace?category=gaming_device"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 hover:text-[#febd69]"
          >
            Gaming Consoles
          </Link>
          {user ? (
            <div className="pt-2 border-t border-slate-700 flex justify-between items-center text-xs">
              <span>Logged in as {user.name}</span>
              <button onClick={handleLogout} className="text-red-400 font-bold">
                Log Out
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-700 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center bg-slate-700 py-1.5 rounded font-bold"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center bg-[#febd69] text-slate-950 py-1.5 rounded font-bold"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
