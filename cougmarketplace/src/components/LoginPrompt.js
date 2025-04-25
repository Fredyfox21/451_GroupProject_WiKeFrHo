import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPrompt({ visible, onClose }) {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      // Start animation on mount
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [visible]);

  const goToLogin = () => {
    router.push('/login');
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 transition-opacity duration-500 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="bg-white shadow-lg rounded-xl p-6 max-w-sm w-full mx-4 transform transition-all duration-500 scale-100">
        <h2 className="text-lg font-semibold mb-2 text-center">Login Required</h2>
        <p className="text-sm text-gray-600 text-center mb-4">
          Please log in to perform this action.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={goToLogin}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Log In
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
