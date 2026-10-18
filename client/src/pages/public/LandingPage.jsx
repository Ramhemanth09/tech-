import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Search,
  Scale,
  ArrowRight,
  Laptop,
  Camera,
  Gamepad2,
  CheckCircle2,
  Play,
  Flame,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { ListingCard } from '../../components/listings/ListingCard.jsx';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton.jsx';

export function LandingPage() {
  const navigate = useNavigate();
  const [featuredListings, setFeaturedListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/listings?limit=6');
        if (res.success && res.data) {
          setFeaturedListings(res.data);
        }
      } catch (err) {
        console.error('Failed to load featured products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="bg-[#eaeded] min-h-screen pb-12 space-y-5">
      {/* Amazon-style Promotional Hero Banner */}
      <div className="relative bg-gradient-to-r from-[#131921] via-[#232f3e] to-[#0f172a] text-white py-8 sm:py-12 px-4 sm:px-8 overflow-hidden shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-[#febd69] text-xs font-bold border border-amber-400/30">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Great Preowned Tech Festival • Up to 40% Off</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-white">
              Shop preowned tech with <span className="text-[#febd69]">verified diagnostics</span>, not guesswork.
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every device includes structured hardware specs, battery health audits, and cited service manuals. Use our <strong>corner AI Assistant</strong> to find and compare anything instantly!
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <Link
                to="/compare?category=laptop&budget=48000&prompt=Compare%20three%20coding%20laptops%20under%20my%20budget&autoRun=true"
                className="bg-[#febd69] hover:bg-[#f3a847] text-slate-950 font-black text-xs py-2.5 px-5 rounded-md shadow-md flex items-center gap-2 border border-amber-400 transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Run Demo Comparison</span>
              </Link>

              <Link
                to="/marketplace"
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 px-5 rounded-md border border-white/20 transition-all flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>Explore All Departments</span>
              </Link>
            </div>
          </div>

          {/* Quick AI Prompt Pill Box */}
          <div className="w-full md:w-80 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 text-xs space-y-2.5 shadow-xl text-left">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#febd69] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Corner AI Shopping Agent
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                Live
              </span>
            </div>
            <p className="text-[11px] text-slate-200 leading-snug">
              Click the floating button in the bottom right corner anytime to speak with our AI. Type what you want, and it will redirect and compare products for you!
            </p>
            <div className="pt-1">
              <Link
                to="/compare"
                className="text-xs text-[#febd69] font-bold hover:underline flex items-center gap-1"
              >
                <span>Try Instant Comparison</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom space-y-6">
        {/* Amazon-style 4-Quadrant Category Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 -mt-4 relative z-20">
          {/* Card 1: Laptops */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Coding & Work Laptops</h3>
              <p className="text-[11px] text-slate-500 mb-3">Dell Latitude, ThinkPad T480, Apple MacBook Pro</p>
              <Link to="/marketplace?category=laptop" className="block overflow-hidden rounded mb-3 bg-slate-50">
                <img
                  src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500&auto=format&fit=crop"
                  alt="Laptops"
                  className="w-full h-36 object-cover hover:scale-105 transition-transform"
                />
              </Link>
            </div>
            <Link
              to="/marketplace?category=laptop"
              className="text-xs font-bold text-blue-700 hover:text-amber-700 hover:underline flex items-center gap-1"
            >
              <span>See all coding laptops</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Cameras */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Cameras & Optics</h3>
              <p className="text-[11px] text-slate-500 mb-3">Sony Alpha A6400, 4K video, verified shutter counts</p>
              <Link to="/marketplace?category=camera" className="block overflow-hidden rounded mb-3 bg-slate-50">
                <img
                  src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop"
                  alt="Cameras"
                  className="w-full h-36 object-cover hover:scale-105 transition-transform"
                />
              </Link>
            </div>
            <Link
              to="/marketplace?category=camera"
              className="text-xs font-bold text-blue-700 hover:text-amber-700 hover:underline flex items-center gap-1"
            >
              <span>Explore mirrorless cameras</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Gaming */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Gaming Devices</h3>
              <p className="text-[11px] text-slate-500 mb-3">PlayStation 5, Nintendo Switch, tested drift-free</p>
              <Link to="/marketplace?category=gaming_device" className="block overflow-hidden rounded mb-3 bg-slate-50">
                <img
                  src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop"
                  alt="Gaming Consoles"
                  className="w-full h-36 object-cover hover:scale-105 transition-transform"
                />
              </Link>
            </div>
            <Link
              to="/marketplace?category=gaming_device"
              className="text-xs font-bold text-blue-700 hover:text-amber-700 hover:underline flex items-center gap-1"
            >
              <span>Browse gaming consoles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: AI Side-by-Side Comparison */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-amber-300 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
            <span className="absolute top-2 right-2 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded uppercase">
              AI Powered
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Compare Before Buying</h3>
              <p className="text-[11px] text-slate-500 mb-3">Inspect battery health, upgradeability & trade-offs</p>
              <Link
                to="/compare?category=laptop&budget=48000&prompt=Compare%20three%20coding%20laptops%20under%20my%20budget&autoRun=true"
                className="block overflow-hidden rounded mb-3 bg-slate-50 border border-slate-100"
              >
                <img
                  src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop"
                  alt="Compare"
                  className="w-full h-36 object-cover hover:scale-105 transition-transform"
                />
              </Link>
            </div>
            <Link
              to="/compare?category=laptop&budget=48000&prompt=Compare%20three%20coding%20laptops%20under%20my%20budget&autoRun=true"
              className="text-xs font-bold text-amber-800 hover:text-amber-900 hover:underline flex items-center gap-1"
            >
              <span>Launch Comparison Tool</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Section: Today's Verified Deals */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Today's Verified Preowned Tech Deals</span>
                <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded">
                  LIMITED TIME
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pre-inspected devices with hardware reports, battery health disclosures, and transparent seller warranties.
              </p>
            </div>

            <Link
              to="/marketplace"
              className="text-xs font-bold text-blue-700 hover:text-amber-700 hover:underline flex items-center gap-1 self-start sm:self-center"
            >
              <span>View all {featuredListings.length} deals</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <LoadingSkeleton count={3} className="h-80" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredListings.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          )}
        </div>

        {/* Trust & Guarantee Banner */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Diagnostic Audits</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">
                Every battery claim, shutter count, and memory spec is audited against manufacturer manuals and diagnostic logs.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Unbiased Comparison</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">
                Our AI highlights omitted battery disclosures, explains trade-offs, and suggests smart questions to ask before buying.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Always in the Corner</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed mt-0.5">
                Look for the corner AI icon anytime. Ask for any tech configuration and get redirected straight to matching options!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
