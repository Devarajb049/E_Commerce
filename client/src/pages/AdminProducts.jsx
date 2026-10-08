import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import SearchBar from '../components/SearchBar';
import { TableSkeleton } from '../components/LoadingSpinner';
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
          success(`Product updated successfully.`);
          closeModal();
          fetchData();
        }
      } else {
        const res = await api.createProduct(payload);
        if (res.success) {
          success(`Product created successfully.`);
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
        success('Product deleted.');
        setDeleteConfirmId(null);
        fetchData();
      }
    } catch (err) {
      console.error('Delete product error:', err);
      toastError(err.message || 'Cannot delete product.');
      setDeleteConfirmId(null);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = search === '' || 
      p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCat = selectedCategory === 'all' || p.category_id.toString() === selectedCategory;

    return matchesSearch && matchesCat;
  });

  const headerActions = (
    <button
      onClick={openAddModal}
      className="btn-primary text-xs py-2 px-3"
    >
      <Plus className="w-3.5 h-3.5" />
      <span>Add Product</span>
    </button>
  );

  return (
    <AdminLayout 
      title="Product Inventory" 
      subtitle="Manage catalog items, pricing, and stock"
      actions={headerActions}
    >
      {/* Search & Category Filter Toolbar */}
      <div className="bg-white border border-brand-border rounded-card p-3 sm:p-4 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <SearchBar
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            placeholder="Search products by title..."
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Filter:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.5 border border-brand-border rounded-input text-xs font-medium text-brand-dark bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/20"
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

      {/* Products Table Surface */}
      <div className="bg-white border border-brand-border rounded-card shadow-subtle overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : filteredProducts.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-xs">
            No products match the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3 px-4 font-semibold">Item</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Price</th>
                  <th className="py-3 px-4 font-semibold text-center">Stock</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => {
                  const isLow = p.stock_quantity > 0 && p.stock_quantity <= 10;
                  const isOut = p.stock_quantity <= 0;

                  return (
                    <tr key={p.product_id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-btn bg-gray-50 overflow-hidden border border-gray-100 flex-shrink-0 flex items-center justify-center">
                            <img
                              src={p.image_url || '/logo-icon.svg'}
                              alt={p.product_name}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.currentTarget.src = '/logo-icon.svg'; }}
                            />
                          </div>
                          <div className="min-w-0 max-w-xs sm:max-w-md">
                            <span className="font-semibold text-brand-dark block truncate text-xs sm:text-sm">
                              {p.product_name}
                            </span>
                            <span className="text-[11px] text-gray-400 block font-mono">
                              ID #{p.product_id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-xs text-gray-600">
                        {p.category_name}
                      </td>

                      <td className="py-3 px-4 font-bold text-brand-dark whitespace-nowrap">
                        ₹{parseFloat(p.price).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-brand-error bg-red-50 border border-red-200">
                            Out of stock (0)
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-brand-warning bg-amber-50 border border-amber-200">
                            Low stock ({p.stock_quantity})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold text-brand-success bg-green-50 border border-green-200">
                            {p.stock_quantity} available
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-gray-500 hover:text-brand-indigo hover:bg-gray-100 rounded-btn transition-colors"
                            title="Edit"
                            aria-label="Edit product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(p.product_id)}
                            className="p-1.5 text-gray-500 hover:text-brand-error hover:bg-red-50 rounded-btn transition-colors"
                            title="Delete"
                            aria-label="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <div className="bg-white rounded-modal max-w-lg w-full p-5 sm:p-6 shadow-dropdown border border-brand-border space-y-4 max-h-[90vh] overflow-y-auto animate-modal-enter">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-brand-dark">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={form.product_name}
                  onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                  placeholder="e.g. Mechanical Keyboard"
                  className="form-input"
                />
                {formErrors.product_name && <p className="text-xs text-red-500 mt-1">{formErrors.product_name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="form-input"
                >
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="1999"
                    className="form-input"
                  />
                  {formErrors.price && <p className="text-xs text-red-500 mt-1">{formErrors.price}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    value={form.stock_quantity}
                    onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                    placeholder="25"
                    className="form-input"
                  />
                  {formErrors.stock_quantity && <p className="text-xs text-red-500 mt-1">{formErrors.stock_quantity}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief product description..."
                  className="form-input"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs py-2 px-4"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs">
          <div className="bg-white rounded-modal max-w-sm w-full p-5 shadow-dropdown space-y-3 animate-modal-enter">
            <div className="w-10 h-10 rounded-full bg-red-50 text-brand-error flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-brand-dark">Confirm Product Deletion</h4>
              <p className="text-xs text-gray-500">
                Are you sure you want to delete this product? Historical orders reference this item.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="btn-danger text-xs py-1.5 px-3"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
};

export default AdminProducts;
