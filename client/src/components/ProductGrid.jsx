import React from 'react';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';

const ProductGrid = ({ products = [], emptyMessage = 'No products match the selected criteria.' }) => {
  if (products.length === 0) {
    return (
      <EmptyState
        title="No Products Found"
        message={emptyMessage}
        actionLabel="Reset Search / Filters"
        actionLink="/products"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
      {products.map((product) => (
        <ProductCard key={product.product_id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
