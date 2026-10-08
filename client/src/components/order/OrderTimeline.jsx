import React from 'react';
import { Check, Clock, Package, Truck, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

/**
 * ClickCart Production-Grade Order Progress Timeline
 * Desktop: Clean horizontal tracker with progress lines and current node pulse
 * Mobile: Vertical readable layout
 */
const OrderTimeline = ({ currentStatus = 'PLACED', createdAt, history = [] }) => {
  const steps = [
    { key: 'PLACED', label: 'Order Placed', icon: Clock },
    { key: 'PROCESSING', label: 'Processing', icon: Package },
    { key: 'SHIPPED', label: 'Shipped', icon: Truck },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 }
  ];

  const isTerminalCancelled = currentStatus === 'CANCELLED';
  const isTerminalReturned = currentStatus === 'RETURNED' || currentStatus === 'RETURN_REQUESTED';
  const isTerminalRefunded = currentStatus === 'REFUNDED';

  // Find index of current status
  let currentIndex = steps.findIndex((s) => s.key === currentStatus);
  if (currentIndex === -1) {
    if (currentStatus === 'PLACED') currentIndex = 0;
    else if (currentStatus === 'PROCESSING') currentIndex = 1;
    else if (currentStatus === 'SHIPPED') currentIndex = 2;
    else if (currentStatus === 'DELIVERED') currentIndex = 4;
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
    <div className="w-full">
      {/* DESKTOP TIMELINE (Horizontal) */}
      <div className="hidden sm:block">
        <div className="relative flex items-center justify-between">
          
          {/* Background Connecting Bar */}
          <div className="absolute top-4 left-6 right-6 h-[2px] bg-slate-200 z-0" />

          {/* Active Filled Progress Bar */}
          <div
            className="absolute top-4 left-6 h-[2px] bg-brand-primary z-0 transition-all duration-500"
            style={{
              width: `${(currentIndex / (steps.length - 1)) * 90}%`
            }}
          />

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
    </div>
  );
};

export default OrderTimeline;
