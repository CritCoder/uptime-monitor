import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '@/lib/toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { api } from '../lib/api';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { fetchUser } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        toast.error('Authentication failed. Please try again.');
        navigate('/login');
        return;
      }

      if (token) {
        try {
          // Store the token
          localStorage.setItem('token', token);

          // Set the authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          // Fetch user data
          await fetchUser();

          toast.success('Successfully signed in!');
          navigate('/dashboard');
        } catch (error) {
          console.error('Auth callback error:', error);
          toast.error('Failed to complete sign in.');
          navigate('/login');
        }
      } else {
        toast.error('No authentication token received.');
        navigate('/login');
      }
    };

    handleCallback();
  }, [searchParams, navigate, fetchUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
