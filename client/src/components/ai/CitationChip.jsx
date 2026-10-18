import React, { useState } from 'react';
import { BookOpen, ExternalLink, X, FileCheck } from 'lucide-react';

export function CitationChip({ citation }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors cursor-pointer"
        title="View grounded document citation"
      >
        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
        <span className="truncate max-w-[180px]">{citation.documentTitle}</span>
        <span className="text-[10px] bg-blue-200/60 px-1 py-0.2 rounded font-mono">
          {citation.chunkId}
        </span>
      </button>

      {/* Citation Popover Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="badge badge-neutral text-[10px] font-mono uppercase tracking-wider mb-1">
                  Source Type: {citation.sourceType}
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {citation.documentTitle}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Section / Page: <span className="text-slate-800">{citation.sectionOrPage || 'General Reference'}</span> • Chunk ID: <code className="font-mono bg-slate-100 px-1 rounded">{citation.chunkId}</code>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed font-serif">
              "{citation.excerpt}"
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <FileCheck className="w-3.5 h-3.5" /> Verifiable Grounded Citation
              </span>
              <button
                onClick={() => setModalOpen(false)}
                className="btn btn-secondary text-xs py-1 px-3"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
