import React from 'react';

const ProductPreview = ({ product, onClick }) => {
  if (!product) return null; // Early return if product is missing

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-lg shadow-md border border-gray-200 w-full md:w-1/3">
      {/* Product Image */}
      <div className="w-full h-48 overflow-hidden rounded-lg mb-4">
        <img
          src={product.image || '/default-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Name */}
      <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">{product.name}</h2>

      {/* Product Price */}
      <p className="text-2xl font-bold text-gray-900 mb-4">${product.price?.toFixed(2)}</p>

      {/* Seller Info */}
      <div className="text-sm text-gray-600">
        <span>Seller: </span>
        <a
          href={`/seller/${product.sellerId}`}
          className="text-red-600 hover:underline"
        >
          {product.sellerName}
        </a>
      </div>

      {/* Button or Action */}
      <button
        onClick={onClick}
        className="mt-4 px-6 py-2 bg-red-600 text-white text-lg font-medium rounded-lg hover:bg-red-700 transition-all"
      >
        View Product
      </button>
    </div>
  );
};

export default ProductPreview;