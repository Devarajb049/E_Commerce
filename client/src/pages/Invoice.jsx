import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
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
        setError(err.message || 'Unable to retrieve invoice from database.');
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
    return <LoadingSpinner fullScreen message="Loading invoice..." />;
  }

  if (error || !order) {
    return <ErrorMessage message={error || 'Invoice not found'} onRetry={() => window.location.reload()} />;
  }

  const invoiceNumber = `INV-${order.order_number.replace('ORD-', '')}`;
  const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* Top Action Toolbar (Hidden in Print) */}
      <div className="flex items-center justify-between no-print pb-4 border-b border-brand-border">
        <Link
          to="/orders"
          className="text-xs sm:text-sm font-semibold text-brand-muted hover:text-brand-indigo inline-flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </Link>

        <button
          onClick={handlePrint}
          className="btn-primary text-xs py-2 px-4 print-include inline-flex items-center gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Invoice</span>
        </button>
      </div>

      {/* COMMERCIAL TAX INVOICE DOCUMENT */}
      <div className="bg-white border border-brand-border rounded-card p-6 sm:p-10 shadow-subtle print-container space-y-8 text-brand-dark">
        
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-gray-200">
          <div>
            <div className="flex items-center gap-2">
              <img src="/logo-icon.svg" alt="ClickCart Logo" className="w-7 h-7" />
              <span className="text-2xl font-bold tracking-tight text-brand-dark">
                Click<span className="text-brand-indigo">Cart</span>
              </span>
            </div>
            <p className="text-xs font-semibold text-brand-orange mt-0.5">
              Shop in a click.
            </p>
            <div className="mt-2 text-xs text-brand-muted space-y-0.5">
              <p>ClickCart Retail India Private Limited</p>
              <p>Outer Ring Rd, Bellandur, Bengaluru, KA 560103</p>
              <p><strong>GSTIN:</strong> 29AABCU9603R1ZM</p>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="inline-block px-2.5 py-0.5 bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-btn uppercase tracking-wider">
              Tax Invoice
            </span>
            <p className="text-sm font-bold text-brand-dark pt-1">
              {invoiceNumber}
            </p>
            <p className="text-xs text-brand-muted">
              Order Ref: <span className="font-mono text-brand-dark font-medium">{order.order_number}</span>
            </p>
            <p className="text-xs text-brand-muted">
              Date: {orderDate}
            </p>
            <p className="text-xs font-semibold text-brand-dark pt-0.5">
              Status: <span className="uppercase">{order.order_status}</span>
            </p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-btn border border-gray-200 text-xs">
          <div>
            <h4 className="font-bold uppercase tracking-wider text-gray-500 mb-1">
              Billed To
            </h4>
            <p className="text-sm font-bold text-brand-dark">{order.customer_name}</p>
            <p className="text-gray-600 mt-0.5 leading-relaxed">{order.address}</p>
            <p className="text-gray-600">{order.city}, {order.state} - {order.pincode}</p>
            <p className="text-gray-600 mt-1">Phone: {order.phone}</p>
            <p className="text-gray-600">Email: {order.email}</p>
          </div>

          <div className="sm:text-right space-y-1">
            <h4 className="font-bold uppercase tracking-wider text-gray-500 mb-1">
              Payment Method
            </h4>
            <p className="text-sm font-semibold text-brand-dark">Cash on Delivery / Direct Store</p>
            <p className="text-gray-500">Currency: Indian Rupee (INR)</p>
            <p className="text-gray-500">Place of Supply: {order.state}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-2 w-10 text-center">#</th>
                <th className="py-2.5 px-2">Item Description</th>
                <th className="py-2.5 px-2 text-center w-16">Qty</th>
                <th className="py-2.5 px-2 text-right w-24">Price</th>
                <th className="py-2.5 px-2 text-right w-24">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items?.map((item, index) => (
                <tr key={item.order_item_id || index}>
                  <td className="py-3 px-2 text-center text-gray-400 font-mono">
                    {index + 1}
                  </td>
                  <td className="py-3 px-2">
                    <span className="font-semibold text-brand-dark block text-xs">
                      {item.product_name}
                    </span>
                    {item.category_name && (
                      <span className="text-[10px] text-gray-400">
                        {item.category_name}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-2 text-center font-semibold text-brand-dark">
                    {item.quantity}
                  </td>
                  <td className="py-3 px-2 text-right text-gray-600">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="py-3 px-2 text-right font-bold text-brand-dark">
                    {formatCurrency(item.subtotal || item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start pt-4 border-t-2 border-gray-200 gap-6">
          <div className="text-[11px] text-gray-500 max-w-sm space-y-0.5">
            <p className="font-semibold text-brand-dark">Notice:</p>
            <p>1. Computer-generated invoice. No physical signature required.</p>
            <p>2. Keep this invoice for any warranty or replacement requests.</p>
          </div>

          <div className="w-full sm:w-64 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-brand-dark">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST (18%):</span>
              <span className="font-semibold text-brand-dark">{formatCurrency(order.tax)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping:</span>
              <span className="font-semibold text-brand-success">Free</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline text-sm">
              <span className="font-bold text-brand-dark">Grand Total:</span>
              <span className="text-lg font-extrabold text-brand-dark">
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
