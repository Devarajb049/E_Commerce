import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Grid, Layers } from 'lucide-react';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state from URL or defaults
  const search = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'default';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';
  const inStockOnly = searchParams.get('in_stock') === 'true';
  const viewMode = searchParams.get('view') || 'products'; // 'products' or 'categories'

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
        setError(err.message || 'Failed to load products from server.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, selectedCategory, sort, minPrice, maxPrice, inStockOnly]);

  // Update query params helper
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-brand-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
            {viewMode === 'categories' ? 'Product Categories' : 'Explore All Products'}
          </h1>
          <p className="text-sm text-brand-muted mt-1">
            {viewMode === 'categories'
              ? `Browse all ${categories.length} organized departments.`
              : `Showing ${products.length} available items across categories.`}
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl self-start md:self-auto">
          <button
            onClick={() => updateParam('view', 'products')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode !== 'categories'
                ? 'bg-white text-brand-indigo shadow-xs'
                : 'text-gray-600 hover:text-brand-dark'
            }`}
          >
            <Grid className="w-4 h-4" />
            Products Grid
          </button>
          <button
            onClick={() => updateParam('view', 'categories')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'categories'
                ? 'bg-white text-brand-indigo shadow-xs'
                : 'text-gray-600 hover:text-brand-dark'
            }`}
          >
            <Layers className="w-4 h-4" />
            Departments ({categories.length})
          </button>
        </div>
      </div>

      {/* If View Mode is Categories */}
      {viewMode === 'categories' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <CategoryCard key={cat.category_id} category={cat} />
          ))}
        </div>
      ) : (
        /* Regular Products Catalog View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* DESKTOP SIDEBAR FILTERS (3 Cols) */}
          <aside className="hidden lg:block lg:col-span-3 bg-white border border-brand-border rounded-2xl p-6 shadow-xs space-y-6 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="font-bold text-sm text-brand-dark flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-brand-indigo" />
                Filter Catalog
              </span>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-medium text-brand-indigo hover:underline"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* Categories Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-muted block">
                Department
              </label>
              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                <button
                  onClick={() => updateParam('category', 'all')}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === 'all'
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
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex justify-between items-center ${
                      selectedCategory === cat.category_id.toString()
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
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-muted block">
                Price Range (₹)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateParam('min_price', e.target.value)}
                  className="w-1/2 p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-indigo outline-none"
                />
                <span className="text-gray-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateParam('max_price', e.target.value)}
                  className="w-1/2 p-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-indigo outline-none"
                />
              </div>
            </div>

            {/* In-Stock Filter */}
            <div className="pt-2 border-t border-gray-100">
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

          {/* MAIN PRODUCT LIST SECTION (9 Cols) */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Search and Sort Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 sm:p-4 border border-brand-border rounded-2xl shadow-xs">
              <div className="flex-1">
                <SearchBar
                  value={search}
                  onChange={(val) => updateParam('search', val)}
                  onClear={() => updateParam('search', '')}
                  placeholder="Search products by title or description..."
                />
              </div>

              <div className="flex items-center gap-2">
                {/* Mobile Filter Trigger Button */}
                <button
                  onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span>Filters</span>
                </button>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-1.5 pl-2 border-l border-gray-200">
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                  <select
                    value={sort}
                    onChange={(e) => updateParam('sort', e.target.value)}
                    className="bg-transparent text-xs font-semibold text-brand-dark py-2 pr-4 focus:outline-none cursor-pointer"
                  >
                    <option value="default">Default Sort</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                    <option value="newest">Newest Arrivals</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile Filter Drawer / Collapse */}
            {mobileFilterOpen && (
              <div className="lg:hidden p-4 bg-white border border-brand-border rounded-2xl space-y-4 shadow-sm animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b">
                  <span className="font-bold text-sm">Filter Products</span>
                  <button onClick={() => setMobileFilterOpen(false)} className="text-gray-400">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase">Category</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => updateParam('category', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-xl text-xs"
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
                    className="w-1/2 p-2 border rounded-xl text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => updateParam('max_price', e.target.value)}
                    className="w-1/2 p-2 border rounded-xl text-xs"
                  />
                </div>

                <div className="flex justify-between items-center pt-2">
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
                    Reset All
                  </button>
                </div>
              </div>
            )}

            {/* Active Filter Tags */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <span className="text-gray-400 font-medium">Applied Filters:</span>
                {search && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-brand-indigo rounded-lg font-medium">
                    Search: "{search}"
                    <button onClick={() => updateParam('search', '')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedCategory !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-brand-indigo rounded-lg font-medium">
                    Category: {categories.find((c) => c.category_id.toString() === selectedCategory)?.category_name || selectedCategory}
                    <button onClick={() => updateParam('category', 'all')}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-brand-indigo rounded-lg font-medium">
                    ₹{minPrice || '0'} - ₹{maxPrice || '∞'}
                    <button onClick={() => { updateParam('min_price', ''); updateParam('max_price', ''); }}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-brand-indigo rounded-lg font-medium">
                    In Stock Only
                    <button onClick={() => updateParam('in_stock', false)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Product Grid / Loading / Error */}
            {loading ? (
              <LoadingSpinner message="Searching ClickCart inventory..." />
            ) : error ? (
              <ErrorMessage message={error} onRetry={() => window.location.reload()} />
            ) : products.length === 0 ? (
              <EmptyState
                title="No Matching Products"
                message="We couldn't find any products matching your search criteria. Try removing filters or searching a different term."
                actionLabel="Clear Filters"
                onActionClick={clearAllFilters}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
