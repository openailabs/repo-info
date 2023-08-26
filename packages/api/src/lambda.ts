import { ingestionRouter } from "./router/ingestion";
import { createTRPCRouter } from "./trpc";

// Deployed to /trpc/lambda/**
export const lambdaRouter = createTRPCRouter({
  ingestion: ingestionRouter,
});

// export { stripe } from './router/stripe/shared';
