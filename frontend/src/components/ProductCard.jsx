import React from 'react';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      {product.imageUrls && product.imageUrls.length > 0 && (
        <img src={product.imageUrls[0]} alt={product.name} className="product-image" />
      )}
      <div className="product-info">
        <h4>{product.name}</h4>
        <p>Price: ${product.price.toFixed(2)}</p>
        <p>Eco Benefit: {product.ecoRating}</p>
      </div>
    </div>
  );
};

export default ProductCard;
