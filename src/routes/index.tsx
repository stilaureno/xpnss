// @ts-nocheck
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '../routeTree.gen.tsx';
import ExpenseDashboard from '@/components/ExpenseDashboard';

export const indexRoute = createRoute({
  path: '/',
  getParentRoute: () => rootRoute,
  component: Dashboard,
});

function Dashboard() {
  return <ExpenseDashboard />;
}