import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api.js';

export function SellerQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState({});

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/seller/questions');
      if (res.success) {
        setQuestions(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAnswerSubmit = async (questionId) => {
    const text = answers[questionId];
    if (!text || !text.trim()) return alert('Answer text cannot be blank');

    setSubmitting((prev) => ({ ...prev, [questionId]: true }));
    try {
      const res = await api.patch(`/api/seller/questions/${questionId}/answer`, {
        answerText: text.trim(),
      });
      if (res.success) {
        fetchQuestions();
        setAnswers((prev) => ({ ...prev, [questionId]: '' }));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  return (
    <div className="container-custom py-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-600" /> Buyer Inquiries & Questions
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Respond to public questions on your active hardware listings.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading questions...</div>
      ) : questions.length === 0 ? (
        <div className="tech-card p-12 text-center text-xs text-slate-500">
          No questions received from buyers yet.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <div key={q._id} className="tech-card p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-blue-600">
                  {q.listingRef?.title}
                </span>
                <span className="text-[11px] text-slate-400">
                  Asked by {q.buyerRef?.name} on {new Date(q.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="font-bold text-slate-900 text-sm">
                Q: {q.questionText}
              </div>

              {q.answerText ? (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Published Answer:
                  </div>
                  <div>{q.answerText}</div>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <textarea
                    rows="2"
                    value={answers[q._id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [q._id]: e.target.value })}
                    placeholder="Type your official answer to display publicly on the listing page..."
                    className="form-textarea text-xs"
                  />
                  <button
                    onClick={() => handleAnswerSubmit(q._id)}
                    disabled={submitting[q._id]}
                    className="btn btn-primary text-xs py-1.5 px-4 font-bold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {submitting[q._id] ? 'Publishing...' : 'Publish Answer'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
