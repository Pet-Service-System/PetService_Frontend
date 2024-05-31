import React, { useState } from 'react';

const ProductDetail = ({ serviceData }) => {
  // State to manage the quantity of the product
  const [quantity, setQuantity] = useState(1);

  // Function to handle increasing the quantity
  const handleIncrease = () => setQuantity(quantity + 1);

  // Function to handle decreasing the quantity
  const handleDecrease = () => setQuantity(quantity > 1 ? quantity - 1 : 1);

  // Function to handle adding the product to the cart
  const handleAddToCart = () => {
    console.log('Added to cart:', serviceData, 'Quantity:', quantity);
  };

  // Function to handle ordering the product
  const handleOrderNow = () => {
    console.log('Ordered:', serviceData, 'Quantity:', quantity);
  };

  if (!serviceData || !serviceData.image || !serviceData.name || !serviceData.price || !serviceData.description) {
    return <div className='flex space-x-2 justify-center items-center bg-black h-screen dark:invert'>
      <span className='sr-only'>Loading...</span>
      <div className='h-8 w-8 bg-white rounded-full animate-bounce [animation-delay:-0.3s]'></div>
      <div className='h-8 w-8 bg-white rounded-full animate-bounce [animation-delay:-0.15s]'></div>
      <div className='h-8 w-8 bg-white rounded-full animate-bounce'></div>
    </div>;
  }

  return (
    // Container for the product detail, using Tailwind CSS for styling
    <div className="flex m-5 py-20 px-32">
      {/* Left section for the product image */}
      <div className="w-1/2 bg-cover bg-center h-96" style={{ backgroundImage: `url(${serviceData.image})` }}></div>

      {/* Right section for the product information */}
      <div className="w-1/2 p-5 ml-10">
        {/* Product name */}
        <h1 className="text-6xl font-bold mb-4">{serviceData.name}</h1>

        {/* Product price */}
        <p className="text-2xl text-green-500 mb-4">{`Price: $${serviceData.price}`}</p>

        {/* Product description */}
        <p className="mb-6">{serviceData.description}</p>

        {/* Quantity control section */}
        <div className="flex items-center mb-6">
          {/* Decrease quantity button */}
          <button onClick={handleDecrease} className="bg-gray-600 text-white border border-gray-400 p-2">-</button>

          {/* Display the current quantity */}
          <span className="mx-3 text-lg">{quantity}</span>

          {/* Increase quantity button */}
          <button onClick={handleIncrease} className="bg-black text-white border border-gray-400 p-2">+</button>
        </div>

        {/* Action buttons section */}
        <div className="flex space-x-4 justify-end">
          {/* Add to Cart button */}
          <button onClick={handleAddToCart} className="bg-blue-500 hover:bg-blue-700 text-white px-4 py-2">Add to Cart</button>

          {/* Order Now button */}
          <button onClick={handleOrderNow} className="bg-green-500 hover:bg-green-700 text-white px-4 py-2">Order Now</button>
        </div>
      </div>
    </div>
  );
};


export default ProductDetail;
