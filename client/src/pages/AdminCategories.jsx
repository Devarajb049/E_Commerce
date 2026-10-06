import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, FolderTree, AlertCircle, X, Layers } from 'lucide-react';
import api from '../services/api';
import AdminNav from '../components/AdminNav';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

const AdminCategories = () => {
  const { success, error: toastError } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setFormError('Category name cannot be empty.');
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
          success(`Category '${res.data.category_name}' updated successfully!`);
          closeModal();
          fetchCategories();
        }
      } else {
        const res = await api.createCategory(payload);
        if (res.success) {
          success(`Category '${res.data.category_name}' created successfully!`);
          closeModal();
          fetchCategories();
        }
      }
    } catch (err) {
      console.error('Save category error:', err);
      setFormError(err.message || 'Failed to save category.');
      toastError(err.message || 'Error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (categoryId) => {
    try {
      const res = await api.deleteCategory(categoryId);
      if (res.success) {
        success('Category deleted successfully.');
        setDeleteConfirmId(null);
        fetchCategories();
      }
    } catch (err) {
      console.error('Delete category error:', err);
      toastError(err.message || 'Cannot delete category.');
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-brand-dark tracking-tight">
              Category Department Management
            </h2>
            <p className="text-sm text-brand-muted">
              Organize product collections and catalog navigation departments.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-indigo text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-indigo/50 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Categories Table */}
        <div className="bg-white border border-brand-border rounded-3xl shadow-xs overflow-hidden">
          {loading ? (
            <LoadingSpinner message="Retrieving departments..." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-brand-muted uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-6 font-bold w-16">ID</th>
                    <th className="py-3.5 px-6 font-bold">Category Name</th>
                    <th className="py-3.5 px-6 font-bold">Description</th>
                    <th className="py-3.5 px-6 font-bold text-center">Assigned Products</th>
                    <th className="py-3.5 px-6 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((c) => (
                    <tr key={c.category_id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-6 font-mono text-gray-400 font-semibold">
                        #{c.category_id}
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-bold text-brand-dark block text-sm sm:text-base">
                          {c.category_name}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-brand-muted text-xs max-w-md truncate">
                        {c.description || 'No description provided.'}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <span className="inline-block px-2.5 py-1 bg-indigo-50 text-brand-indigo font-bold rounded-lg text-xs">
                          {c.product_count} items
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 text-gray-500 hover:text-brand-indigo hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(c.category_id)}
                            className="p-1.5 text-gray-500 hover:text-brand-error hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete category"
                          >
                            <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-brand-dark">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="e.g. Smart Wearables"
                  className="w-full px-3.5 py-2 border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-muted mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short description of products in this department..."
                  className="w-full px-3.5 py-2 border rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-brand-indigo/30 focus:border-brand-indigo outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand-indigo hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
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
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-base font-bold text-brand-dark">Delete Category</h4>
              <p className="text-xs text-brand-muted">
                Categories with existing products cannot be deleted. If products belong to this category, the action will be safely rejected.
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

export default AdminCategories;
