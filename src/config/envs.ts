import 'dotenv/config';
import { z } from 'zod';

interface EnvVars {
  PORT: number;
  STRIPE_SECRET: string;
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_SUCCESS_URL: string;
  STRIPE_CANCEL_URL: string;
  NATS_SERVERS: string[];
}

const envsSchema = z
  .object({
    PORT: z.coerce.number(),
    STRIPE_SECRET: z.coerce.string(),
    STRIPE_WEBHOOK_SECRET: z.coerce.string(),
    STRIPE_SUCCESS_URL: z.coerce.string(),
    STRIPE_CANCEL_URL: z.coerce.string(),
    NATS_SERVERS: z.array(z.coerce.string()),
  })
  .passthrough();

const envVars = envsSchema.parse({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

export const envs: EnvVars = {
  ...envVars,
};
