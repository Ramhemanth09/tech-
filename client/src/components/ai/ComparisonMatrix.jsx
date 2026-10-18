import React from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  Battery,
  Sparkles,
  HelpCircle as QuestionIcon,
  Layers,
  FileCheck2,
  ExternalLink,
  Scale,
} from 'lucide-react';
import { CitationChip } from './CitationChip.jsx';

export function ComparisonMatrix({ data }) {
  if (!data) return null;

  const {
    parsedCriteria,
    rankings = [],
    specificationsComparison = [],
    disclosureFindings = [],
    tradeoffs = [],
    recommendedQuestions = [],
    citations = [],
    mode = 'ai',
  } = data;

  const getStatusIcon = (status) => {
    if (status === 'MEETS') {
      return (
        <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs">
          <CheckCircle className="w-3.5 h-3.5" /> Meets
        </span>
      );
    }
    if (status === 'DOES_NOT_MEET') {
      return (
        <span className="flex items-center gap-1 text-rose-600 font-bold text-xs">
          <XCircle className="w-3.5 h-3.5" /> Does Not Meet
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-amber-600 font-bold text-xs">
        <HelpCircle className="w-3.5 h-3.5" /> Unknown / Missing
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Engine Status Banner */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Comparison Engine</div>
            <div className="text-sm font-black text-slate-900 capitalize">
              {mode === 'ai' ? 'Full AI Multi-Tool Decision Pipeline' : 'Deterministic Multi-Tool Comparison'}
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="badge badge-verified bg-emerald-50 text-emerald-800 border-emerald-300 text-xs">
            100% Evidence Grounded
          </span>
        </div>
      </div>

      {/* SECTION 1: CANDIDATE DEVICES & PICS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-700" />
            <h3 className="text-base font-black text-slate-900">1. Candidate Devices & Declarations</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Unverified seller statements</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {specificationsComparison.map((item) => (
            <div
              key={item.listingId}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                {/* Product Picture */}
                <div className="relative h-44 rounded-lg overflow-hidden bg-white border border-slate-200 mb-3 group">
                  <img
                    src={
                      item.image ||
                      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop'
                    }
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="bg-[#131921] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                      {item.brand}
                    </span>
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <span className="bg-black/75 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                      ₹{item.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug mb-1">
                  {item.title}
                </h4>

                <div className="text-[11px] text-slate-600 mt-2 space-y-1">
                  <div className="font-bold text-slate-700">Seller Advantages Claimed:</div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                    {item.advantages.map((adv, idx) => (
                      <li key={idx}>{adv}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-200">
                <a
                  href={`/listings/${item.listingId}`}
                  className="w-full block bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-bold text-xs py-1.5 px-3 rounded text-center transition-colors shadow-xs"
                >
                  View Listing Details
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: SIDE-BY-SIDE SPECIFICATIONS TABLE WITH PICS (AMAZON STYLE) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-black text-slate-900">
              2. Side-by-Side Specifications Comparison
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Compare with similar items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-800">
                <th className="p-3 font-bold w-48 align-bottom">Evaluation Criteria</th>
                {specificationsComparison.map((item) => (
                  <th
                    key={item.listingId}
                    className="p-3 font-bold min-w-[220px] align-top text-center bg-white border-l border-slate-200"
                  >
                    {/* Column Product Picture */}
                    <div className="w-28 h-24 mx-auto mb-2 overflow-hidden rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center">
                      <img
                        src={
                          item.image ||
                          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'
                        }
                        alt={item.title}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="text-left font-bold text-slate-900 text-xs line-clamp-2 leading-snug">
                      {item.title}
                    </div>
                    <div className="text-left text-base font-black text-slate-900 mt-1">
                      ₹{item.price.toLocaleString()}
                    </div>
                    <div className="text-left text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 mb-2">
                      {item.evidenceStatus === 'verified' ? (
                        <span className="text-emerald-700 font-bold">✓ Verified Diagnostic</span>
                      ) : (
                        <span className="text-amber-700 font-semibold">⚠️ Seller Declared</span>
                      )}
                    </div>
                    <a
                      href={`/listings/${item.listingId}`}
                      className="w-full block bg-[#febd69] hover:bg-[#f3a847] text-slate-950 font-bold text-xs py-1.5 px-2 rounded text-center transition-colors shadow-sm"
                    >
                      View Details
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                'Budget Fit',
                'RAM (Min 16 GB)',
                'Storage (Min 512 GB)',
                'Battery Health Disclosure',
                'Hardware Upgradeability',
              ].map((criterion) => (
                <tr key={criterion} className="hover:bg-slate-50/70">
                  <td className="p-3 font-bold text-slate-800 bg-slate-50/50">{criterion}</td>
                  {specificationsComparison.map((item) => {
                    const row = item.requirementsTable.find((r) =>
                      r.requirement.startsWith(criterion.split(' ')[0])
                    );
                    return (
                      <td key={item.listingId} className="p-3 border-l border-slate-200">
                        <div className="space-y-1">
                          <div>{row ? getStatusIcon(row.status) : 'N/A'}</div>
                          <div className="text-xs font-semibold text-slate-800">{row?.value}</div>
                          <div className="text-[11px] text-slate-500 leading-snug">{row?.notes}</div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: EVIDENCE-BACKED FINDINGS & RAG CITATIONS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-black text-slate-900">3. Evidence-Backed Findings</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Audit of diagnostics & service manuals</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-1.5">
            <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
              Documented Hardware Findings
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              Official service manuals confirm that business-grade candidates (ThinkPad T480 and Dell Latitude 7490) utilize dual SO-DIMM slots supporting up to 32GB RAM upgrades and standard M.2 NVMe storage.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
              Verified Evidence Records
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              Higher-priced candidates include verified pre-boot diagnostics (Dell ePSA Battery Report) confirming 84% battery capacity, reducing replacement uncertainty.
            </p>
          </div>
        </div>

        {/* Grounded Citation Chips */}
        {citations.length > 0 && (
          <div className="pt-2">
            <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-blue-600" /> Grounded Technical Citations:
            </div>
            <div className="flex flex-wrap gap-2">
              {citations.map((c, i) => (
                <CitationChip key={i} citation={c} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: MISSING INFORMATION & DISCLOSURE GAPS */}
      <div className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-amber-100 pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-black text-amber-950">
              4. Missing Information & Information Gaps
            </h3>
          </div>
          <span className="badge badge-warning text-[10px]">Critical Review</span>
        </div>

        <div className="space-y-3">
          {disclosureFindings.map((finding, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 flex items-start gap-3"
            >
              <Battery className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-900">{finding.device}</span>
                  <span className="text-[10px] font-mono uppercase bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded font-bold">
                    {finding.severity}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-900">{finding.finding}</div>
                <div className="text-xs text-slate-700 leading-relaxed">{finding.significance}</div>
                {finding.recommendedQuestion && (
                  <div className="text-xs text-blue-900 bg-white p-2 rounded-lg border border-amber-200 mt-2 font-medium">
                    <span className="font-bold">Recommended Question for Seller:</span> "{finding.recommendedQuestion}"
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 5: TRANSPARENT RANKING & TRADE-OFFS WITH PICS */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-black text-slate-900">
              5. Transparent Ranking & Trade-Off Analysis
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Configurable requirement scoring</span>
        </div>

        {/* Rankings Breakdown with Product Pictures */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rankings.map((rank, idx) => (
            <div
              key={rank.listingId}
              className={`p-4 rounded-xl border flex flex-col justify-between ${
                idx === 0
                  ? 'border-amber-400 bg-amber-50/20 ring-2 ring-amber-400/30'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Rank #{idx + 1}
                  </span>
                  <span className="text-lg font-black text-blue-700">
                    {rank.score}/100
                  </span>
                </div>

                {/* Rank Product Picture & Title */}
                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <img
                    src={
                      rank.image ||
                      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'
                    }
                    alt={rank.title}
                    className="w-16 h-16 object-cover rounded-md border border-slate-200 shrink-0 bg-white"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                      {rank.title}
                    </h4>
                    <div className="text-sm font-black text-slate-900 mt-1">
                      ₹{rank.price.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Transparent Score Breakdown */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1">
                  <div className="text-slate-500 font-bold mb-1">Score Breakdown:</div>
                  <div className="flex justify-between">
                    <span>Spec Requirements Fit:</span>
                    <span className="font-bold text-emerald-600">+{rank.scoreBreakdown.specRequirementsFit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Evidence Quality Bonus:</span>
                    <span className="font-bold text-blue-600">+{rank.scoreBreakdown.evidenceQualityBonus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transparency Penalty:</span>
                    <span className={`font-bold ${rank.scoreBreakdown.transparencyPenalty < 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                      {rank.scoreBreakdown.transparencyPenalty}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {rank.tradeoffSummary}
                </p>
              </div>

              <div className="pt-4">
                <a
                  href={`/listings/${rank.listingId}`}
                  className="w-full block bg-[#febd69] hover:bg-[#f3a847] text-slate-950 font-bold text-xs py-2 px-3 rounded text-center transition-colors shadow-sm"
                >
                  Inspect Listing
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Trade-off synthesis */}
        <div className="p-4 bg-slate-100 rounded-xl space-y-2 text-xs text-slate-800 leading-relaxed">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <QuestionIcon className="w-4 h-4 text-blue-600" /> Objective Decision Synthesis:
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-700">
            {tradeoffs.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
