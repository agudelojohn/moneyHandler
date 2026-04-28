import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { env } from "@/lib/config/env";

const hasStaticCreds = env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY;

const client = new DynamoDBClient({
  region: env.AWS_REGION,
  ...(hasStaticCreds
    ? {
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID!,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
        },
      }
    : {}),
});

export const db = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export const TABLE_NAME = env.AWS_TABLE_NAME;