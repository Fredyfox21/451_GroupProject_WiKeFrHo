import React from 'react';

const Button = ({
  label = 'Click me',        // Default label if none is passed
  onClick = () => {},        // Default empty function for onClick
  size = 'medium',           // Default size is 'medium'
  color = 'blue',            // Default color is 'blue'
  disabled = false,          // Default to not disabled
  className = '',            // Additional custom class if needed
}) => {
  // Define base styles for the button
  const baseStyles = 'transition-all duration-200 ease-in-out rounded focus:outline-none';

  // Define styles for the different sizes
  const sizeStyles = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg',
  };

  // Define styles for the different colors
  const colorStyles = {
    blue: 'bg-blue-500 text-white hover:bg-blue-600',
    red: 'bg-red-500 text-white hover:bg-red-600',
    green: 'bg-green-500 text-white hover:bg-green-600',
    gray: 'bg-gray-500 text-white hover:bg-gray-600',
  };

  // Combine all styles
  const buttonStyles = `${baseStyles} ${sizeStyles[size]} ${colorStyles[color]} ${className} ${
    disabled ? 'opacity-50 cursor-not-allowed' : ''
  }`;

  return (
    <button
      onClick={!disabled ? onClick : undefined} // Prevent onClick if disabled
      className={buttonStyles}
      disabled={disabled} // Disable button if disabled prop is true
    >
      {label}
    </button>
  );
};

export default Button;
