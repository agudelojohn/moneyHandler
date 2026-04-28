import { z } from "zod";

const envSchema = z.object({
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    AWS_TABLE_NAME: z.string(),
    AWS_REGION: z.string(),
})

export const env = envSchema.parse(process.env);