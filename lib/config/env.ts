import { z } from "zod";

const envSchema = z.object({
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    AWS_TABLE_NAME: z.string(),
    AWS_REGION: z.string(),
    AWS_TABLE_NAME_DEV: z.string(),
    NEXT_PUBLIC_APP_ENV: z.string(),
})

export const env = envSchema.parse(process.env);