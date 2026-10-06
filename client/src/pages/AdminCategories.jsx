import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, X, Search, FolderTree } from 'lucide-react';
import api from '../services/api';
import AdminLayout from '../components/AdminLayout';
import { TableSkeleton } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/ToastContext';

const AdminCategories = () => {
  const { success, error: toastError } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.getCategories();
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toastError(err.message || 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.category_name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setDescription('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setCategoryName(cat.category_name);
    setDescription(cat.description || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setFormError('Category name is required.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      const payload = {
        category_name: categoryName.trim(),
        description: description.trim()
      };

      if (editingCategory) {
        const res = await api.updateCategory(editingCategory.category_id, payload);
        if (res.success) {
          success(`Category "${res.data.category_name}" updated.`);
          closeModal();
          fetchCategories();
        }
      } else {
        const res = await api.createCategory(payload);
        if (res.success) {
          success(`Category "${res.data.category_name}" created.`);
          closeModal();
          fetchCategories();
        }
      }
    } catch (err) {
      console.error('Save category error:', err);
      setFormError(err.message || 'Failed to save category.');
      toastError(err.message || 'Error saving category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      const res = await api.deleteCategory(categoryId);
      if (res.success) {
        success('Category removed successfully.');
        setDeleteConfirmId(null);
        fetchCategories();
      }
    } catch (err) {
      console.error('Delete category error:', err);
      toastError(err.message || 'Cannot delete category with active products.');
      setDeleteConfirmId(null);
    }
  };

  return (
    <AdminLayout
      title="Categories"
      subtitle="Organize product catalog departments and navigation taxonomy"
      actions={
        <button
          onClick={openAddModal}
          className="btn-primary text-xs py-2 px-3.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      }
    >
      <div className="space-y-4">
        {/* Search bar */}
        <div className="bg-white border border-brand-border rounded-card p-3 shadow-subtle flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter categories by name or description..."
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-brand-border rounded-btn text-xs text-brand-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-indigo/20 focus:border-brand-indigo transition-all"
            />
          </div>
          <span className="text-xs text-brand-muted hidden sm:inline">
            Showing {filteredCategories.length} of {categories.length} departments
          </span>
        </div>

        {/* Table Surface */}
        <div className="bg-white border border-brand-border rounded-card shadow-subtle overflow-hidden">
          {loading ? (
            <TableSkeleton rows={6} />
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 text-center">
              <EmptyState
                icon={FolderTree}
                title="No categories found"
                description={searchQuery ? 'Try adjusting your search query.' : 'Get started by creating your first product category.'}
                actionText={searchQuery ? 'Clear Search' : 'Add Category'}
                onAction={searchQuery ? () => setSearchQuery('') : openAddModal}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-brand-border text-gray-500 uppercase tracking-wider font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4 w-14">ID</th>
                    <th className="py-3 px-4 font-semibold">Category Name</th>
                    <th className="py-3 px-4 font-semibold">Description</th>
                    <th className="py-3 px-4 font-semibold text-center w-36">Assigned Products</th>
                    <th className="py-3 px-4 font-semibold text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCategories.map((c) => (
                    <tr key={c.category_id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-gray-400 font-medium">
                        #{c.category_id}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-brand-dark text-sm">
                          {c.category_name}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-brand-muted max-w-md truncate">
                        {c.description || '—'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-brand-indigo font-semibold rounded-btn text-xs">
                          {c.product_count} {c.product_count === 1 ? 'item' : 'items'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 text-gray-500 hover:text-brand-indigo hover:bg-gray-100 rounded-btn transition-colors"
                            title="Edit Category"
                            aria-label={`Edit ${c.category_name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(c.category_id)}
                            className="p-1.5 text-gray-500 hover:text-brand-error hover:bg-red-50 rounded-btn transition-colors"
                            title="Delete Category"
                            aria-label={`Delete ${c.category_name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-modal border border-brand-border max-w-md w-full p-6 shadow-dropdown space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <h3 className="text-base font-bold text-brand-dark">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 text-gray-400 hover:text-brand-dark rounded-btn hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-btn text-brand-error text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">
                  Category Name <span className="text-brand-error">*</span>
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Smart Wearables"
                  className="form-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-dark mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of products categorized under this department..."
                  className="form-input text-xs resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-brand-border">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-secondary text-xs py-2 px-3.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs py-2 px-4"
                >
                  {submitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-modal border border-brand-border max-w-sm w-full p-5 shadow-dropdown space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-50 text-brand-error flex items-center justify-center mx-auto border border-red-100">
              <AlertCircle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-brand-dark">Delete Category</h4>
              <p className="text-xs text-brand-muted">
                Categories with existing products cannot be deleted. If products are linked to this category, the deletion will be rejected to preserve catalog integrity.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-brand-border">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="btn-secondary text-xs py-2 px-3.5"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="btn-danger text-xs py-2 px-3.5"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;
