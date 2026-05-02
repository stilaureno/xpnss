// @ts-nocheck
import { Route as rootRouteDef } from './routes/__root';
import { Route as indexRouteDef } from './routes/index';

export const routeTree = rootRouteDef.addChildren([indexRouteDef]);

export const rootRoute = rootRouteDef;
export const IndexRoute = indexRouteDef;