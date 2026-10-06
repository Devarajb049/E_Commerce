import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft, CheckCircle2, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Invoice = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.getOrder(id);
        if (res.success) {
          setOrder(res.data);
        }
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError(err.message || 'Unable to retrieve invoice from MySQL database.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amt);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Generating ClickCart Tax Invoice..." />;
  }

  if (error || !order) {
    return <ErrorMessage message={error || 'Invoice not found'} onRetry={() => window.location.reload()} />;
  }

  const invoiceNumber = `INV-${order.order_number.replace('ORD-', '')}`;
  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Action Toolbar (Hidden in Print) */}
      <div className="flex items-center justify-between no-print pb-4 border-b border-brand-border">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-muted hover:text-brand-indigo transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-indigo hover:bg-indigo-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 print-include"
        >
          <Printer className="w-4 h-4" />
          <span>Print Tax Invoice</span>
        </button>
      </div>

      {/* INVOICE PAPER CONTAINER */}
      <div className="bg-white border border-brand-border rounded-3xl p-6 sm:p-10 shadow-sm print-container space-y-8 text-brand-dark">
        
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2.5">
              <img src="/logo-icon.svg" alt="ClickCart Logo" className="w-8 h-8" />
              <div>
                <span className="text-2xl font-black tracking-tight text-brand-dark">
                  Click<span className="text-brand-indigo">Cart</span>
                </span>
                <p className="text-[11px] font-semibold text-brand-orange uppercase tracking-wider">
                  Shop in a click.
                </p>
              </div>
            </div>
            <div className="mt-3 text-xs text-brand-muted space-y-0.5">
              <p>ClickCart Retail India Private Limited</p>
              <p>Outer Ring Rd, Bellandur, Bengaluru, KA 560103</p>
              <p><strong>GSTIN:</strong> 29AABCU9603R1ZM | <strong>CIN:</strong> U72900KA2026PTC109823</p>
              <p><strong>Support:</strong> care@clickcart.local</p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-200 text-brand-indigo text-xs font-bold rounded-lg uppercase tracking-wider">
              Tax Invoice
            </span>
            <p className="text-sm font-bold text-brand-dark pt-1">
              {invoiceNumber}
            </p>
            <p className="text-xs text-brand-muted">
              Order Ref: <span className="font-mono font-semibold text-brand-dark">{order.order_number}</span>
            </p>
            <p className="text-xs text-brand-muted">
              Date: {orderDate}
            </p>
            <div className="pt-1">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                order.order_status === 'DELIVERED'
                  ? 'bg-green-100 text-green-800'
                  : order.order_status === 'CANCELLED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                Status: {order.order_status}
              </span>
            </div>
          </div>
        </div>

        {/* Bill To / Ship To Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-xs">
          <div>
            <h4 className="font-bold uppercase tracking-wider text-brand-muted mb-1.5">
              Billed & Shipped To:
            </h4>
            <p className="text-sm font-bold text-brand-dark">{order.customer_name}</p>
            <p className="text-gray-600 mt-1 leading-relaxed">{order.address}</p>
            <p className="text-gray-600">{order.city}, {order.state} - {order.pincode}</p>
            <p className="text-gray-600 mt-1">Phone: {order.phone}</p>
            <p className="text-gray-600">Email: {order.email}</p>
          </div>

          <div className="sm:text-right flex flex-col justify-between">
            <div>
              <h4 className="font-bold uppercase tracking-wider text-brand-muted mb-1.5">
                Payment Details:
              </h4>
              <p className="text-sm font-semibold text-brand-dark">Direct Store / Cash on Delivery</p>
              <p className="text-gray-500">Currency: Indian Rupee (INR)</p>
            </div>
            <div className="pt-2 text-gray-500">
              <p>Place of Supply: {order.state}</p>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 text-brand-muted uppercase tracking-wider">
                <th className="py-3 px-2 font-bold w-12 text-center">#</th>
                <th className="py-3 px-2 font-bold">Item Description</th>
                <th className="py-3 px-2 font-bold text-center w-20">Qty</th>
                <th className="py-3 px-2 font-bold text-right w-28">Unit Price</th>
                <th className="py-3 px-2 font-bold text-right w-28">Line Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items?.map((item, index) => (
                <tr key={item.order_item_id || index}>
                  <td className="py-3.5 px-2 text-center text-gray-400 font-mono">
                    {index + 1}
                  </td>
                  <td className="py-3.5 px-2">
                    <span className="font-semibold text-brand-dark block text-sm">
                      {item.product_name}
                    </span>
                    {item.category_name && (
                      <span className="text-[10px] text-gray-400">
                        Category: {item.category_name}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-2 text-center font-bold text-brand-dark">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 px-2 text-right font-medium text-gray-600">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="py-3.5 px-2 text-right font-bold text-brand-dark">
                    {formatCurrency(item.subtotal || item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start pt-4 border-t-2 border-gray-200 gap-6">
          <div className="text-xs text-brand-muted max-w-sm space-y-1">
            <p className="font-semibold text-brand-dark">Terms & Conditions:</p>
            <p>1. All products sold by ClickCart are guaranteed 100% authentic.</p>
            <p>2. Keep this invoice for any warranty or replacement claims within 7 days.</p>
            <p>3. Computer-generated tax invoice — no signature required.</p>
          </div>

          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-brand-muted">
              <span>Subtotal:</span>
              <span className="font-semibold text-brand-dark">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-brand-muted">
              <span>Integrated GST (18%):</span>
              <span className="font-semibold text-brand-dark">{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between text-brand-muted">
              <span>Shipping & Handling:</span>
              <span className="font-semibold text-emerald-600">FREE</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline text-sm">
              <span className="font-extrabold text-brand-dark">Grand Total:</span>
              <span className="text-xl font-extrabold text-brand-dark">
                {formatCurrency(order.total_amount)}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Invoice;
