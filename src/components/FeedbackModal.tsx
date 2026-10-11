import React, { useState } from 'react';
import { 
  TriageFeedback, 
  TriageResult 
} from '../types';
import { 
  X, 
  CheckCircle2, 
  Star, 
  Smile, 
  Frown, 
  HeartHandshake, 
  Download,
  Check
} from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: TriageResult;
  onSubmitted: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  result,
  onSubmitted,
}) => {
  const [rating, setRating] = useState(5);
  const [anxietyReduced, setAnxietyReduced] = useState<boolean | null>(true);
  const [actionPlanClear, setActionPlanClear] = useState<boolean | null>(true);
  const [comments, setComments] = useState('');
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const feedback: TriageFeedback = {
      rating,
      anxietyReduced: anxietyReduced ?? true,
      clarityRating: rating,
      actionPlanClear: actionPlanClear ?? true,
      comments,
      timestamp: new Date().toISOString(),
    };

    // Save to local storage for audit / history
    try {
      const existing = JSON.parse(localStorage.getItem('triage_feedbacks') || '[]');
      existing.push(feedback);
      localStorage.setItem('triage_feedbacks', JSON.stringify(existing));
    } catch {
      // ignore
    }

    setIsDone(true);
    setTimeout(() => {
      onSubmitted();
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 text-slate-200">
        
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Log Feedback & Conclude Session
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isDone ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-950 border border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Thank You for Your Feedback!</h4>
            <p className="text-xs text-slate-400">
              Your evaluation assists in ongoing clinical triage safety refinement and ER overload mitigation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Anxiety Reduction Question (Addresses Pain Point!) */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-200 block mb-2">
                Did this triage assessment reduce your anxiety about your symptoms?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAnxietyReduced(true)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                    anxietyReduced === true
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Smile className="w-4 h-4 text-emerald-400" />
                  <span>Yes, I feel calmer</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAnxietyReduced(false)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                    anxietyReduced === false
                      ? 'bg-amber-950 border-amber-500 text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Frown className="w-4 h-4 text-amber-400" />
                  <span>Still concerned</span>
                </button>
              </div>
            </div>

            {/* Clarity of Next Steps */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-200 block mb-2">
                Are your recommended next steps clear to you?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setActionPlanClear(true)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                    actionPlanClear === true
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                  <span>Very Clear</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActionPlanClear(false)}
                  className={`py-2 px-3 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition ${
                    actionPlanClear === false
                      ? 'bg-slate-800 border-slate-600 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>Need more info</span>
                </button>
              </div>
            </div>

            {/* Star Rating */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Overall Assistant Experience:
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-600 hover:text-amber-400 transition"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Any comments or suggestions? (Optional)
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={2}
                placeholder="Share your experience..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              Submit Feedback & Complete
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
