import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Scale,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  Bot,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api.js';
import { ComparisonMatrix } from '../../components/ai/ComparisonMatrix.jsx';

export function ComparisonAgentPage() {
  const [searchParams] = useSearchParams();

  const urlPrompt = searchParams.get('prompt') || 'Compare three coding laptops under my budget';
  const urlBudget = searchParams.get('budget') ? Number(searchParams.get('budget')) : 48000;
  const urlCategory = searchParams.get('category') || 'laptop';
  const autoRun = searchParams.get('autoRun') === 'true';

  const [prompt, setPrompt] = useState(urlPrompt);
  const [budget, setBudget] = useState(urlBudget);
  const [category, setCategory] = useState(urlCategory);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [toolExecutions, setToolExecutions] = useState([]);
  const [error, setError] = useState(null);

  const runAgent = async (overridePrompt, overrideBudget, overrideCategory) => {
    const targetPrompt = overridePrompt || prompt;
    const targetBudget = overrideBudget !== undefined ? overrideBudget : budget;
    const targetCategory = overrideCategory || category;

    if (!targetPrompt.trim() || loading) return;

    setError(null);
    setLoading(true);
    setResultData(null);
    setToolExecutions([]);

    try {
      const res = await api.post('/api/comparison-agent', {
        prompt: targetPrompt.trim(),
        budget: Number(targetBudget) || undefined,
        category: targetCategory,
      });

      if (res.success && res.data) {
        setResultData(res.data);
        if (res.meta?.toolExecutions) {
          setToolExecutions(res.meta.toolExecutions);
        }
      }
    } catch (err) {
      setError(err.message || 'Comparison agent execution encountered an error');
    } finally {
      setLoading(false);
    }
  };

  const handleRunAgent = (e) => {
    if (e) e.preventDefault();
    runAgent();
  };

  // Auto-run if triggered via query params from Chat or Links
  useEffect(() => {
    if (autoRun || searchParams.get('prompt')) {
      setPrompt(urlPrompt);
      setBudget(urlBudget);
      setCategory(urlCategory);
      runAgent(urlPrompt, urlBudget, urlCategory);
    }
  }, [searchParams]);

  const triggerMandatoryDemo = () => {
    setPrompt('Compare three coding laptops under my budget');
    setBudget(48000);
    setCategory('laptop');
    runAgent('Compare three coding laptops under my budget', 48000, 'laptop');
  };

  return (
    <div className="container-custom py-6 space-y-6 animate-fade-in">
      {/* Amazon-style Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1">
            <span>Marketplace</span>
            <span>›</span>
            <span>Compare with Similar Items</span>
            <span>›</span>
            <span className="text-amber-700 font-semibold uppercase">{category}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Side-by-Side Tech Comparison & Spec Inspector
          </h1>
        </div>

        {/* 1-Click Demo Evaluation Button */}
        <button
          type="button"
          onClick={triggerMandatoryDemo}
          className="bg-[#febd69] hover:bg-[#f3a847] text-slate-950 font-bold text-xs py-2 px-4 rounded-lg shadow-sm flex items-center gap-2 shrink-0 border border-amber-400 transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run Demo Comparison</span>
        </button>
      </div>

      {/* Query Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <form onSubmit={handleRunAgent} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-6">
            <label className="text-xs font-bold text-slate-700 block mb-1">Comparison Query</label>
            <input
              type="text"
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Compare three coding laptops under my budget..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="md:col-span-3">
            <label className="text-xs font-bold text-slate-700 block mb-1">Budget Ceiling (₹)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="48000"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 bg-white"
            >
              <option value="laptop">Laptops</option>
              <option value="camera">Cameras</option>
              <option value="gaming_device">Gaming</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#131921] hover:bg-[#232f3e] disabled:opacity-50 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              {loading ? <Sparkles className="w-3.5 h-3.5 animate-spin text-[#febd69]" /> : <Play className="w-3.5 h-3.5 fill-current text-[#febd69]" />}
              <span>{loading ? 'Comparing...' : 'Compare'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Execution Status / Pipeline Pills */}
      {toolExecutions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs py-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pipeline:</span>
          {toolExecutions.map((tool, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="font-semibold">{tool.toolName}</span>
              <span className="text-slate-400">({tool.executionTimeMs}ms)</span>
            </span>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <div>{error}</div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3 shadow-sm">
          <Sparkles className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Analyzing Specifications & Disclosures</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Checking battery health diagnostic records, verifying RAM expandability in service manuals, and calculating trade-off rankings...
          </p>
        </div>
      )}

      {/* Structured Comparison Matrix Component */}
      {resultData && <ComparisonMatrix data={resultData} />}
    </div>
  );
}
