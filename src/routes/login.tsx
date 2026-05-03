import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '../routeTree.gen';
import { supabase } from '@/lib/supabase';
import { Auth } from '@supabase/auth-ui-react';
import { useEffect, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';

export const loginRoute = createRoute({
  path: '/login',
  getParentRoute: () => rootRoute,
  component: Login,
});

function Login() {
  const navigate = useNavigate();

  const checkAndRedirect = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      navigate({ to: '/' });
      return true;
    }
    return false;
  }, [navigate]);

  useEffect(() => {
    checkAndRedirect();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        navigate({ to: '/' });
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAndRedirect, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use your email and password to sign in
          </p>
        </div>
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <Auth
            supabaseClient={supabase}
            enableSignUp={false}
            appearance={{
              theme: 'default',
              variables: {
                default: {
                  colors: {
                    brand: '#3b82f6',
                    brandAccent: '#2563eb',
                  },
                },
              },
            }}
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
}