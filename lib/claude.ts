import Anthropic from "@anthropic-ai/sdk";

const apiKey = process.env.C4U_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY;
export const anthropic = new Anthropic({ apiKey });
export const isConfigured = () => Boolean(apiKey);
