import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X, AlertTriangle, Eye, Check } from 'lucide-react';
import api from '../services/api';
import AdminNav from '../components/AdminNav';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

const AdminProducts = () => {
  const { success, error: toastError } = useToast();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    product_name: '',
    category_id: '',
    price: '',
    stock_quantity: '',
    description: '',
    image_url: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, cRes] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ]);
      if (pRes.success) setProducts(pRes.data);
      if (cRes.success) setCategories(cRes.data);
    } catch (err) {
      console.error('Error fetching admin products:', err);
      toastError(err.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setForm({
      product_name: '',
      category_id: categories.length > 0 ? categories[0].category_id.toString() : '',
      price: '',
      stock_quantity: '',
      description: '',
      image_url: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      product_name: product.product_name,
      category_id: product.category_id.toString(),
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      description: product.description || '',
      image_url: product.image_url || ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const validateForm = () => {
    const errs = {};
    if (!form.product_name.trim()) errs.product_name = 'Product name is required';
    if (!form.category_id) errs.category_id = 'Category is required';
    
    const priceVal = parseFloat(form.price);
    if (isNaN(priceVal) || priceVal <= 0) errs.price = 'Price must be greater than 0';

    const stockVal = parseInt(form.stock_quantity, 10);
    if (isNaN(stockVal) || stockVal < 0) errs.stock_quantity = 'Stock must be 0 or more';

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const payload = {
        product_name: form.product_name.trim(),
        category_id: parseInt(form.category_id, 10),
        price: parseFloat(form.price),
        stock_quantity: parseInt(form.stock_quantity, 10),
        description: form.description.trim(),
        image_url: form.image_url.trim()
      };

      if (editingProduct) {
        const res = await api.updateProduct(editingProduct.product_id, payload);
        if (res.success) {
          success(`Product '${res.data.product_name}' updated successfully!`);
          closeModal();
          fetchData();
        }
      } else {
        const res = await api.createProduct(payload);
        if (res.success) {
          success(`Product '${res.data.product_name}' created successfully!`);
          closeModal();
          fetchData();
        }
      }
    } catch (err) {
      console.error('Save product error:', err);
      toastError(err.message || 'Failed to save product in MySQL.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      const res = await api.deleteProduct(productId);
      if (res.success) {
        success('Product deleted successfully.');
        setDeleteConfirmId(null);
        fetchData();
      }
    } catch (err) {
      console.error('Delete product error:', err);
      toastError(err.message || 'Cannot delete product.');
      setDeleteConfirmId(null);
    }
  };

  // Filter products in memory for instant responsiveness
  const filteredProducts = products.filter((p) => {
    const matchesSearch = search === '' || 
      p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCat = selectedCategory === 'all' || p.category_id.toString() === selectedCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-brand-dark tracking-tight">
              Product Inventory Management
            </h2>
            <p className="text-sm text-brand-muted">
              Add, update prices, adjust stock levels, and delete products from the MySQL database.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-indigo text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="bg-white border border-brand-border rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-96">
            <SearchBar
              value={search}
              onChange={setSearch}
              onClear={() => setSearch('')}
              placeholder="Search products by name or description..."
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs text-brand-muted font-semibold whitespace-nowrap">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 border border-brand-border rounded-xl text-xs font-semibold text-brand-dark bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/30"
            >
              <option value="all">All Departments ({products.length})</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id.toString()}>
                  {c.category_name} ({c.product_count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white border border-brand-border rounded-3xl shadow-xs overflow-hidden">
          {loading ? (
            <LoadingSpinner message="Loading catalog from database..." />
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-brand-muted text-sm">
              No products found matching your search.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-brand-muted uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4 font-bold">Item</th>
                    <th className="py-3.5 px-4 font-bold">Category</th>
                    <th className="py-3.5 px-4 font-bold">Price</th>
                    <th className="py-3.5 px-4 font-bold text-center">Stock Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((p) => {
                    const isLow = p.stock_quantity > 0 && p.stock_quantity <= 10;
                    const isOut = p.stock_quantity <= 0;

                    return (
                      <tr key={p.product_id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0 flex items-center justify-center">
                              <img
                                src={p.image_url || '/logo-icon.svg'}
                                alt={p.product_name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = '/logo-icon.svg';
                                }}
                              />
                            </div>
                            <div className="min-w-0 max-w-xs sm:max-w-md">
                              <span className="font-bold text-brand-dark block truncate">
                                {p.product_name}
                              </span>
                              <span className="text-[11px] text-brand-muted truncate block">
                                ID #{p.product_id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-xs font-semibold text-gray-600">
                          {p.category_name}
                        </td>

                        <td className="py-3 px-4 font-bold text-brand-dark">
                          ₹{parseFloat(p.price).toLocaleString('en-IN')}
                        </td>

                        <td className="py-3 px-4 text-center">
                          {isOut ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white bg-brand-error">
                              Out of Stock (0)
                            </span>
                          ) : isLow ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white bg-brand-orange">
                              Low Stock ({p.stock_quantity})
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-800 bg-emerald-100">
                              {p.stock_quantity} in stock
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 text-gray-500 hover:text-brand-indigo hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit product"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setDeleteConfirmId(p.product_id)}
                              className="p-1.5 text-gray-500 hover:text-brand-error hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-brand-dark">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={form.product_name}
                  onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                  className="w-full px-3.5 py-2 border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo outline-none"
                />
                {formErrors.product_name && <p className="text-xs text-red-500 mt-1">{formErrors.product_name}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Category *
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                    Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="2499.00"
                    className="w-full px-3.5 py-2 border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo outline-none"
                  />
                  {formErrors.price && <p className="text-xs text-red-500 mt-1">{formErrors.price}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={form.stock_quantity}
                    onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                    placeholder="25"
                    className="w-full px-3.5 py-2 border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo outline-none"
                  />
                  {formErrors.stock_quantity && <p className="text-xs text-red-500 mt-1">{formErrors.stock_quantity}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed specifications and product features..."
                  className="w-full px-3.5 py-2 border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand-indigo hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Saving to Database...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-brand-error flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-brand-dark">Confirm Product Deletion</h4>
              <p className="text-xs text-brand-muted">
                Are you sure you want to permanently delete this product? If the product is part of existing orders, the database will safely prevent deletion.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-brand-error hover:bg-red-700 text-white rounded-xl text-xs font-semibold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;
