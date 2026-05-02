// @ts-nocheck
import { createRouter } from '@tanstack/react-router';
import { rootRoute } from './routeTree.gen.tsx';
import { indexRoute } from './routes/index';

const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}