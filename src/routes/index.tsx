// @ts-nocheck
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '../routeTree.gen';
import { supabase } from '@/lib/supabase';
import ExpenseDashboard from '@/components/ExpenseDashboard';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';

export const indexRoute = createRoute({
  path: '/',
  getParentRoute: () => rootRoute,
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      navigate({ to: '/login' });
    } else {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate({ to: '/login' });
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAuth, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return <ExpenseDashboard />;
}