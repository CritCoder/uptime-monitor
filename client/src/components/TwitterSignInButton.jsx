import { useState } from 'react';
import { toast } from 'sonner';

export default function TwitterSignInButton({ text = 'Continue with Twitter' }) {
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const handleTwitterSignIn = async () => {
    setLoading(true);
    try {
      // Check if Twitter OAuth is available
      const response = await fetch(`${API_BASE_URL}/auth/twitter`, {
        method: 'GET',
        redirect: 'manual'
      });

      if (response.status === 400) {
        // Twitter OAuth not configured
        const errorData = await response.json();
        toast.error(errorData.message || 'Twitter Sign-In is not available in development mode');
        return;
      }

      if (response.type === 'opaqueredirect' || response.status === 302) {
        // Redirect to Twitter OAuth
        window.location.href = `${API_BASE_URL}/auth/twitter`;
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (error) {
      console.error('Twitter OAuth error:', error);
      toast.error('Twitter Sign-In is not available in development mode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleTwitterSignIn}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
          fill="#000000"
        />
      </svg>
      {loading ? 'Checking...' : text}
    </button>
  );
}
