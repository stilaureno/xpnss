// @ts-nocheck
import { createFileRoute } from '@tanstack/react-router';
import ExpenseDashboard from '@/components/ExpenseDashboard';

export const Route = createFileRoute('/')({
  component: Dashboard,
});

function Dashboard() {
  return <ExpenseDashboard />;
}