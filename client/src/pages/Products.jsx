import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Grid, Layers, Package } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import SearchBar from '../components/SearchBar';
import { ProductSkeletonGrid } from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { id: routeCategoryId } = useParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state from URL or defaults
  const search = searchParams.get('search') || '';
  const selectedCategory = routeCategoryId || searchParams.get('category') || searchParams.get('categoryId') || 'all';
  const sort = searchParams.get('sort') || 'default';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const inStockOnly = searchParams.get('in_stock') === 'true';
  const viewMode = searchParams.get('view') || 'products';

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch categories once
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.getCategories();
        if (res.success) setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products based on filters
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {};
        if (search) params.search = search;
        if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
        if (sort && sort !== 'default') params.sort = sort;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        if (inStockOnly) params.in_stock_only = 'true';

        const res = await api.getProducts(params);
        if (res.success) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to load products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, selectedCategory, sort, minPrice, maxPrice, inStockOnly]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === '' || value === 'all' || value === false || value === 'default') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(
    search || (selectedCategory && selectedCategory !== 'all') || minPrice || maxPrice || inStockOnly || (sort && sort !== 'default')
  );

  const activeCategoryObj = categories.find(
    (c) =>
      String(c.id) === String(selectedCategory) ||
      String(c.slug).toLowerCase() === String(selectedCategory).toLowerCase() ||
      c.name?.toLowerCase() === String(selectedCategory).toLowerCase()
  );

  useEffect(() => {
    if (activeCategoryObj) {
      document.title = `${activeCategoryObj.name || activeCategoryObj.category_name} | ClickKart`;
    } else if (search) {
      document.title = `Search: ${search} | ClickKart`;
    } else {
      document.title = 'Products | ClickKart';
    }
  }, [activeCategoryObj, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-border gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
            {viewMode === 'categories'
              ? 'Departments'
              : activeCategoryObj
              ? (activeCategoryObj.name || activeCategoryObj.category_name)
              : search
              ? `Search Results for "${search}"`
              : 'Product Catalog'}
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            {viewMode === 'categories'
              ? `Browse all ${categories.length} store departments.`
              : activeCategoryObj
              ? (activeCategoryObj.description || `Showing ${products.length} authentic products in ${activeCategoryObj.name}.`)
              : `Find products from ${categories.length} departments (${products.length} items available).`}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-btn self-start sm:self-auto">
          <button
            onClick={() => updateParam('view', 'products')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs font-semibold transition-all ${viewMode !== 'categories'
              ? 'bg-white text-brand-indigo shadow-subtle'
              : 'text-gray-600 hover:text-brand-dark'
              }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Products</span>
          </button>
          <button
            onClick={() => updateParam('view', 'categories')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs font-semibold transition-all ${viewMode === 'categories'
              ? 'bg-white text-brand-indigo shadow-subtle'
              : 'text-gray-600 hover:text-brand-dark'
              }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Categories ({categories.length})</span>
          </button>
        </div>
      </div>

      {viewMode === 'categories' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <CategoryCard key={cat.category_id} category={cat} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">

          {/* DESKTOP SIDEBAR FILTERS (3 Cols) */}
          <aside className="hidden lg:block lg:col-span-3 bg-white border border-brand-border rounded-card p-5 space-y-5 shadow-subtle sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="font-bold text-xs uppercase tracking-wider text-brand-dark flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-brand-indigo" />
                Filters
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-brand-indigo hover:underline"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                Department
              </label>
              <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
                <button
                  onClick={() => updateParam('category', 'all')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-btn text-xs font-medium transition-colors ${selectedCategory === 'all'
                    ? 'bg-indigo-50 text-brand-indigo font-bold'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.category_id}
                    onClick={() => updateParam('category', cat.category_id.toString())}
                    className={`w-full text-left px-2.5 py-1.5 rounded-btn text-xs font-medium transition-colors flex justify-between items-center ${selectedCategory === cat.category_id.toString()
                      ? 'bg-indigo-50 text-brand-indigo font-bold'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <span className="truncate">{cat.category_name}</span>
                    <span className="text-[10px] text-gray-400">({cat.product_count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="space-y-1.5 pt-3 border-t border-gray-100">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                Price (₹)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateParam('min_price', e.target.value)}
                  className="w-1/2 p-2 border border-brand-border rounded-input text-xs focus:ring-1 focus:ring-brand-indigo outline-none"
                />
                <span className="text-gray-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateParam('max_price', e.target.value)}
                  className="w-1/2 p-2 border border-brand-border rounded-input text-xs focus:ring-1 focus:ring-brand-indigo outline-none"
                />
              </div>
            </div>

            {/* Stock Filter */}
            <div className="pt-3 border-t border-gray-100">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => updateParam('in_stock', e.target.checked)}
                  className="rounded text-brand-indigo focus:ring-brand-indigo h-4 w-4"
                />
                <span>In-Stock Items Only</span>
              </label>
            </div>
          </aside>

          {/* MAIN PRODUCT CATALOG (9 Cols) */}
          <main className="lg:col-span-9 space-y-5">

            {/* Search and Sort Toolbar */}
            <div className="bg-white border border-brand-border rounded-card p-3 sm:p-4 shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex-1">
                <SearchBar
                  value={search}
                  onChange={(val) => updateParam('search', val)}
                  onClear={() => updateParam('search', '')}
                  placeholder="Search products by title or description..."
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                  className="lg:hidden btn-secondary text-xs py-2 px-3"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </button>

                <div className="flex items-center gap-1.5 pl-2 border-l border-gray-200">
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                  <select
                    value={sort}
                    onChange={(e) => updateParam('sort', e.target.value)}
                    className="bg-transparent text-xs font-semibold text-brand-dark py-1.5 pr-2 focus:outline-none cursor-pointer"
                  >
                    <option value="default">Sort: Default</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                    <option value="newest">Newest Arrivals</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile Filters Drawer */}
            {mobileFilterOpen && (
              <div className="lg:hidden p-4 bg-white border border-brand-border rounded-card space-y-4 shadow-subtle">
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="font-bold text-xs uppercase text-gray-700">Filter Products</span>
                  <button onClick={() => setMobileFilterOpen(false)} className="text-gray-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-gray-500 uppercase">Department</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => updateParam('category', e.target.value)}
                    className="w-full p-2 border border-brand-border rounded-input text-xs"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.category_id} value={c.category_id.toString()}>
                        {c.category_name} ({c.product_count})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => updateParam('min_price', e.target.value)}
                    className="w-1/2 p-2 border rounded-input text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => updateParam('max_price', e.target.value)}
                    className="w-1/2 p-2 border rounded-input text-xs"
                  />
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <label className="text-xs flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => updateParam('in_stock', e.target.checked)}
                      className="rounded"
                    />
                    <span>In-stock only</span>
                  </label>
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-brand-indigo font-semibold"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}

            {/* Results Grid / Skeleton / Empty */}
            {loading ? (
              <ProductSkeletonGrid count={8} />
            ) : error ? (
              <ErrorMessage message={error} onRetry={() => window.location.reload()} />
            ) : products.length === 0 ? (
              <EmptyState
                title="No Products Found"
                message="No products match your active search filters."
                actionLabel="Reset Filters"
                onActionClick={clearAllFilters}
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                {products.map((product) => (
                  <ProductCard key={product.product_id} product={product} />
                ))}
              </div>
            )}

          </main>
        </div>
      )}

    </div>
  );
};

export default Products;
