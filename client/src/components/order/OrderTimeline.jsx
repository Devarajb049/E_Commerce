import React from 'react';
import { Check, Clock, Package, Truck, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

/**
 * Normalizes status strings across database conventions, uppercase tokens,
 * and Title Case strings to guarantee accurate timeline stage matching.
 */
export const normalizeTimelineStatus = (raw) => {
  if (!raw) return 'PLACED';
  const clean = String(raw).trim().toUpperCase().replace(/[\s-]+/g, '_');
  if (clean === 'ORDER_PLACED' || clean === 'ORDERPLACED' || clean === 'PLACED') return 'PLACED';
  if (clean === 'PROCESSING') return 'PROCESSING';
  if (clean === 'SHIPPED') return 'SHIPPED';
  if (clean === 'OUT_FOR_DELIVERY' || clean === 'OUTFORDELIVERY') return 'OUT_FOR_DELIVERY';
  if (clean === 'DELIVERED') return 'DELIVERED';
  if (clean === 'CANCELLED' || clean === 'CANCELED') return 'CANCELLED';
  if (clean === 'RETURN_REQUESTED' || clean === 'RETURNREQUESTED') return 'RETURN_REQUESTED';
  if (clean === 'RETURNED') return 'RETURNED';
  if (clean === 'REFUNDED') return 'REFUNDED';
  return clean;
};

/**
 * ClickCart Production-Grade Order Progress Timeline
 * Desktop: Clean horizontal tracker with progress lines and current node pulse
 * Mobile: Vertical readable layout
 */
const OrderTimeline = ({ currentStatus = 'PLACED', createdAt, history = [] }) => {
  const normalized = normalizeTimelineStatus(currentStatus);

  const steps = [
    { key: 'PLACED', label: 'Order Placed', icon: Clock },
    { key: 'PROCESSING', label: 'Processing', icon: Package },
    { key: 'SHIPPED', label: 'Shipped', icon: Truck },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 }
  ];

  const isTerminalCancelled = normalized === 'CANCELLED';
  const isTerminalReturned = normalized === 'RETURNED' || normalized === 'RETURN_REQUESTED';
  const isTerminalRefunded = normalized === 'REFUNDED';

  // Find index of current status
  let currentIndex = steps.findIndex((s) => s.key === normalized);
  if (currentIndex === -1) {
    if (normalized === 'PLACED') currentIndex = 0;
    else if (normalized === 'PROCESSING') currentIndex = 1;
    else if (normalized === 'SHIPPED') currentIndex = 2;
    else if (normalized === 'OUT_FOR_DELIVERY') currentIndex = 3;
    else if (normalized === 'DELIVERED') currentIndex = 4;
    else currentIndex = 0;
  }

  // If order is cancelled, show specialized alert banner
  if (isTerminalCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-red-900">
        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold">Order Cancelled</h4>
          <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
            This order has been cancelled and inventory was safely restored. No further shipment actions will occur.
          </p>
        </div>
      </div>
    );
  }

  // If order is returned or refunded
  if (isTerminalReturned || isTerminalRefunded) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-900">
        <RotateCcw className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold">
            {isTerminalRefunded ? 'Order Refunded' : 'Return In Progress'}
          </h4>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            {isTerminalRefunded 
              ? 'The refund for this order has been successfully completed.'
              : 'Your return request has been recorded and is currently being processed by our team.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* DESKTOP TIMELINE (Horizontal) */}
      <div className="hidden sm:block">
        <div className="relative flex items-center justify-between">
          
          {/* Background Connecting Bar with active filled progress bar inside */}
          <div className="absolute top-4 left-6 right-6 h-[2px] bg-slate-200 z-0 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-primary transition-all duration-500 rounded-full"
              style={{
                width: `${(currentIndex / (steps.length - 1)) * 100}%`
              }}
            />
          </div>

          {steps.map((step, idx) => {
            const isCompleted = idx < currentIndex;
            const isCurrent = idx === currentIndex;
            const isUpcoming = idx > currentIndex;

            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center group">
                {/* Node Circle */}
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
                    ${isCompleted ? 'bg-brand-primary text-white shadow-sm' : ''}
                    ${isCurrent ? 'bg-brand-primary text-white ring-4 ring-indigo-100 anim-timeline-pulse' : ''}
                    ${isUpcoming ? 'bg-white border-2 border-slate-300 text-slate-400' : ''}
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    <step.icon className="w-3.5 h-3.5" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                    mt-2 text-xs text-center font-medium
                    ${isCurrent ? 'text-brand-primary font-bold' : isCompleted ? 'text-brand-dark' : 'text-slate-400'}
                  `}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* MOBILE TIMELINE (Vertical) */}
      <div className="sm:hidden space-y-4 pl-2">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isUpcoming = idx > currentIndex;

          return (
            <div key={step.key} className="flex items-start gap-3 relative">
              {idx < steps.length - 1 && (
                <div
                  className={`absolute left-3.5 top-7 bottom-0 w-[2px] -mb-4 ${
                    idx < currentIndex ? 'bg-brand-primary' : 'bg-slate-200'
                  }`}
                />
              )}

              <div
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10
                  ${isCompleted ? 'bg-brand-primary text-white shadow-sm' : ''}
                  ${isCurrent ? 'bg-brand-primary text-white ring-4 ring-indigo-100 anim-timeline-pulse' : ''}
                  ${isUpcoming ? 'bg-white border-2 border-slate-300 text-slate-400' : ''}
                `}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <step.icon className="w-3 h-3" />
                )}
              </div>

              <div className="pt-0.5">
                <p
                  className={`text-xs font-semibold ${
                    isCurrent ? 'text-brand-primary font-bold' : isCompleted ? 'text-brand-dark' : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-[11px] text-brand-muted mt-0.5">Current Status</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Activity Log / History Events */}
      {history && history.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200/80">
          <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Status History
          </h5>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {history.map((ev, i) => (
              <div key={i} className="flex items-start justify-between text-xs text-slate-600 bg-slate-50/60 px-2.5 py-1.5 rounded-lg border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary flex-shrink-0" />
                  <span className="font-semibold text-slate-800">{String(ev.status || '').replace(/_/g, ' ')}</span>
                  {ev.note && <span className="text-slate-500 text-[11px] truncate max-w-xs">— {ev.note}</span>}
                </div>
                {ev.created_at && (
                  <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                    {new Date(ev.created_at).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTimeline;
