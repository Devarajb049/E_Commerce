import React, { useState, useEffect } from 'react';
import { ArrowUp, Instagram, X as CloseIcon } from 'lucide-react';

/**
 * ClickCart Premium Grid-Based Minimal Footer CTA
 * 
 * Specifications:
 * - Subtle technical grid background (56px spacing, #F9FAFB bg, #E5E7EB grid)
 * - Oversized centered headline ("Let's Shop Smarter") with #111827 / #4F46E5 typography contrast
 * - 4 circular social buttons with hover elevation & indigo state
 * - 2 pill-shaped legal buttons linking to accessible modal policies
 * - Huge architectural background wordmark ("CLICKCART") with clamp(120px, 20vw, 400px)
 * - Centered uppercase copyright with dynamic year
 * - Floating Back-To-Top button appearing on scroll with smooth/reduced-motion handling
 */
const ClickCartFooter = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [policyModal, setPolicyModal] = useState(null); // 'privacy' | 'terms' | null

  // Scroll detection for floating back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 280);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setPolicyModal(null);
      }
    };
    if (policyModal) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [policyModal]);

  // Smooth scroll to top honoring prefers-reduced-motion
  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  };

  // 4 Official brand social channels
  const socialLinks = [

    {
      name: 'Instagram',
      icon: Instagram,
      href: 'https://instagram.com',
      label: 'ClickCart Instagram',
      isCustomSvg: false,
    }

  ];

  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer
        className="relative w-full min-h-[500px] lg:min-h-[600px] bg-[#F9FAFB] border-t border-[#E5E7EB] overflow-hidden flex flex-col justify-between items-center text-center select-none pt-20 pb-12 sm:pt-28 sm:pb-16 px-4"
        style={{
          backgroundColor: '#F9FAFB',
          backgroundImage: `
            linear-gradient(to right, rgba(229, 231, 235, 0.75) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(229, 231, 235, 0.75) 1px, transparent 1px)
          `,
          backgroundSize: '56px 56px',
        }}
      >
        {/* Layer 1: Oversized Background Wordmark (z-index: 1, aria-hidden) */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 -translate-x-1/2 bottom-3 sm:-bottom-4 lg:-bottom-8 pointer-events-none select-none text-[#E5E7EB] font-black tracking-tighter whitespace-nowrap z-[1] leading-none"
          style={{
            fontSize: 'clamp(120px, 20vw, 250px)',
            opacity: 0.45,
            lineHeight: 0.92,
          }}
        >
          CLICKCART
        </div>

        {/* Layer 2: Main Footer Content (z-index: 2) */}
        <div className="relative z-[2] w-full max-w-5xl mx-auto flex flex-col items-center justify-between flex-1">

          {/* Section: Main Headline */}
          <div className="mb-10 sm:mb-12">
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-[84px] xl:text-[96px] font-extrabold tracking-[-0.04em] text-[#111827] leading-[0.98] select-none text-center">
              Let&apos;s <span className="text-[#4F46E5]">Shop Smarter</span>
            </h2>
          </div>

          {/* Section: Circular Social Icons */}
          <nav aria-label="Social Media Links" className="mb-8 sm:mb-10">
            <ul className="flex items-center justify-center gap-3 sm:gap-4 p-0 m-0 list-none">
              {socialLinks.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.label}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border border-[#E5E7EB] shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex items-center justify-center text-[#111827] hover:text-[#4F46E5] hover:border-[#4F46E5] hover:-translate-y-[3px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40"
                    >
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 transition-colors duration-200" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Section: Pill-Shaped Legal Buttons */}
          <nav aria-label="Legal Links" className="mb-20 sm:mb-28 lg:mb-32 w-full max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => setPolicyModal('privacy')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white border border-[#E5E7EB] text-[#374151] hover:text-[#4F46E5] hover:border-[#4F46E5] text-xs sm:text-sm font-semibold tracking-[0.08em] uppercase shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:-translate-y-[2px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40 cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setPolicyModal('terms')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white border border-[#E5E7EB] text-[#374151] hover:text-[#4F46E5] hover:border-[#4F46E5] text-xs sm:text-sm font-semibold tracking-[0.08em] uppercase shadow-[0_1px_3px_0_rgba(0,0,0,0.04)] hover:-translate-y-[2px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40 cursor-pointer"
              >
                Terms of Service
              </button>
            </div>
          </nav>

          {/* Section: Centered Copyright */}
          <div className="pt-4 pb-2 text-center">
            <p className="text-xs sm:text-sm font-semibold text-[#64748B] tracking-[0.1em] uppercase">
              &copy; {currentYear} CLICKCART. ALL RIGHTS RESERVED.
            </p>
          </div>

        </div>
      </footer>

      {/* Floating Back-To-Top Circular Button (z-index: 40) */}
      <button
        type="button"
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 w-14 h-14 rounded-full bg-white border border-[#DDE3EC] shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] flex items-center justify-center text-[#111827] hover:text-[#4F46E5] hover:border-[#4F46E5] hover:-translate-y-[3px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40 cursor-pointer ${showBackToTop ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        aria-label="Back to top"
        title="Back to top"
      >
        <ArrowUp className="w-5 h-5 transition-transform duration-200" />
      </button>

      {/* Legal Information Modal Dialog */}
      {policyModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="legal-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setPolicyModal(null)}
        >
          <div
            className="bg-white rounded-2xl border border-[#E5E7EB] max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 id="legal-modal-title" className="text-lg font-bold text-[#111827]">
                {policyModal === 'privacy' ? 'ClickCart Privacy Policy' : 'ClickCart Terms of Service'}
              </h3>
              <button
                type="button"
                onClick={() => setPolicyModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40"
                aria-label="Close modal"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 leading-relaxed space-y-3">
              <p className="font-semibold text-slate-800">
                Effective Date: January 1, {currentYear}
              </p>

              {policyModal === 'privacy' ? (
                <>
                  <p>
                    ClickCart is committed to protecting your privacy. This policy explains how we handle your personal data when browsing our catalog and placing orders:
                  </p>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
                    <li><strong>Order Information:</strong> We store contact details and shipping addresses solely to process, deliver, and track your orders.</li>
                    <li><strong>Payment Security:</strong> ClickCart does not store credit card or banking secrets. All payments are encrypted via standard industry protocols.</li>
                    <li><strong>Cart Persistence:</strong> We utilize client-side local storage to maintain your active cart across sessions.</li>
                    <li><strong>Data Protection:</strong> Your personal data is never sold or rented to third-party advertising brokers.</li>
                  </ul>
                  <p>
                    If you have questions regarding your stored profile data, contact our support team at <span className="font-semibold text-[#4F46E5]">support@clickcart.com</span>.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    By accessing ClickCart and completing purchases on our platform, you agree to the following terms and commercial conditions:
                  </p>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
                    <li><strong>Order Placement:</strong> Orders are subject to product availability and database stock verification.</li>
                    <li><strong>Pricing & Taxes:</strong> All product prices include applicable GST as itemized during checkout.</li>
                    <li><strong>Cancellations:</strong> Orders may be cancelled by customers while in the PLACED status prior to dispatch.</li>
                    <li><strong>Returns:</strong> Eligible items may be returned within 7 days of delivery for a replacement or full refund.</li>
                  </ul>
                  <p>
                    ClickCart reserves the right to update these terms to reflect changes in regulatory standards and fulfillment workflows.
                  </p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setPolicyModal(null)}
                className="py-2 px-5 rounded-lg text-xs font-semibold bg-[#111827] text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClickCartFooter;
