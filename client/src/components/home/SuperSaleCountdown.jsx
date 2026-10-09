import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const CAMPAIGN_END_STORAGE_KEY = 'clickkart_campaign_end_v1';

// Get or persist a fixed campaign end date (5 days ahead from first initialization)
function getCampaignEndDate() {
  try {
    const saved = localStorage.getItem(CAMPAIGN_END_STORAGE_KEY);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed > Date.now()) {
        return parsed;
      }
    }
    // Set 4 days, 18 hours from now as the official campaign end timestamp
    const futureDate = Date.now() + (4 * 24 * 60 * 60 + 18 * 60 * 60 + 35 * 60) * 1000;
    localStorage.setItem(CAMPAIGN_END_STORAGE_KEY, futureDate.toString());
    return futureDate;
  } catch {
    return Date.now() + (4 * 24 * 60 * 60) * 1000;
  }
}

export default function SuperSaleCountdown({ onExpire }) {
  const [endTime] = useState(() => getCampaignEndDate());
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, endTime - Date.now()));

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(timer);
        if (onExpire) onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire]);

  const isExpired = timeLeft <= 0;

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  const formatUnit = (val) => String(val).padStart(2, '0');

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-3 sm:p-4 text-white shadow-elevated inline-flex flex-col items-center sm:items-start gap-2">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-400 tracking-wider uppercase">
        <Clock className="w-3.5 h-3.5" />
        <span>Super Sale Ends In</span>
      </div>

      {isExpired ? (
        <div className="text-xs font-bold text-red-400 py-1">
          Sale Ended — Stay tuned for the next campaign!
        </div>
      ) : (
        <div className="flex items-center gap-2 sm:gap-3 text-center font-mono">
          {/* Days */}
          <div className="flex flex-col items-center">
            <span className="text-lg sm:text-2xl font-black text-white bg-slate-800/90 px-2 py-1 rounded-md min-w-[36px] sm:min-w-[44px] shadow-2xs border border-slate-700">
              {formatUnit(days)}
            </span>
            <span className="text-[9px] text-slate-400 font-sans mt-0.5 uppercase tracking-wider font-semibold">Days</span>
          </div>

          <span className="text-amber-400 font-bold text-sm sm:text-lg mb-3">:</span>

          {/* Hours */}
          <div className="flex flex-col items-center">
            <span className="text-lg sm:text-2xl font-black text-white bg-slate-800/90 px-2 py-1 rounded-md min-w-[36px] sm:min-w-[44px] shadow-2xs border border-slate-700">
              {formatUnit(hours)}
            </span>
            <span className="text-[9px] text-slate-400 font-sans mt-0.5 uppercase tracking-wider font-semibold">Hours</span>
          </div>

          <span className="text-amber-400 font-bold text-sm sm:text-lg mb-3">:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <span className="text-lg sm:text-2xl font-black text-white bg-slate-800/90 px-2 py-1 rounded-md min-w-[36px] sm:min-w-[44px] shadow-2xs border border-slate-700">
              {formatUnit(minutes)}
            </span>
            <span className="text-[9px] text-slate-400 font-sans mt-0.5 uppercase tracking-wider font-semibold">Mins</span>
          </div>

          <span className="text-amber-400 font-bold text-sm sm:text-lg mb-3">:</span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <span className="text-lg sm:text-2xl font-black text-brand-orange bg-slate-800/90 px-2 py-1 rounded-md min-w-[36px] sm:min-w-[44px] shadow-2xs border border-slate-700">
              {formatUnit(seconds)}
            </span>
            <span className="text-[9px] text-slate-400 font-sans mt-0.5 uppercase tracking-wider font-semibold">Secs</span>
          </div>
        </div>
      )}
    </div>
  );
}
