import OpenAI from "openai";
import { AI_MODELS } from "@/config/ai.config";
import { AiProviderError } from "../types";
import type {
  AiProvider,
  AiChatOptions,
  AiChatResult,
  AiChatChunk,
  AiVisionOptions,
  AiEmbeddingOptions,
  AiEmbeddingResult,
} from "../types";

export function createOpenAiProvider(apiKey: string): AiProvider {
  const client = new OpenAI({ apiKey });

  return {
    key: "OPENAI",
    capabilities: { chat: true, vision: true, embedding: true },

    async chat({ messages, model, maxTokens, temperature }: AiChatOptions): Promise<AiChatResult> {
      try {
        const response = await client.chat.completions.create({
          model: model ?? AI_MODELS.openai.chat,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          max_tokens: maxTokens ?? 1024,
          temperature: temperature ?? 0.4,
        });

        const choice = response.choices[0];
        return {
          content: choice?.message?.content ?? "",
          model: response.model,
          providerKey: "OPENAI",
          tokensIn: response.usage?.prompt_tokens,
          tokensOut: response.usage?.completion_tokens,
        };
      } catch (error) {
        throw new AiProviderError("OpenAI chat request failed.", "OPENAI", error);
      }
    },

    async *chatStream({ messages, model, maxTokens, temperature }: AiChatOptions): AsyncGenerator<AiChatChunk> {
      try {
        const stream = await client.chat.completions.create({
          model: model ?? AI_MODELS.openai.chat,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          max_tokens: maxTokens ?? 1024,
          temperature: temperature ?? 0.4,
          stream: true,
        });

        for await (const part of stream) {
          const delta = part.choices[0]?.delta?.content ?? "";
          if (delta) yield { delta, done: false };
        }
        yield { delta: "", done: true };
      } catch (error) {
        throw new AiProviderError("OpenAI streaming chat request failed.", "OPENAI", error);
      }
    },

    async analyzeImage({ imageUrl, prompt, model, maxTokens }: AiVisionOptions): Promise<AiChatResult> {
      try {
        const response = await client.chat.completions.create({
          model: model ?? AI_MODELS.openai.vision,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: imageUrl } },
              ],
            },
          ],
          max_tokens: maxTokens ?? 1024,
        });

        const choice = response.choices[0];
        return {
          content: choice?.message?.content ?? "",
          model: response.model,
          providerKey: "OPENAI",
          tokensIn: response.usage?.prompt_tokens,
          tokensOut: response.usage?.completion_tokens,
        };
      } catch (error) {
        throw new AiProviderError("OpenAI image analysis request failed.", "OPENAI", error);
      }
    },

    async embed({ texts, model }: AiEmbeddingOptions): Promise<AiEmbeddingResult> {
      try {
        const response = await client.embeddings.create({
          model: model ?? AI_MODELS.openai.embedding,
          input: texts,
        });

        return {
          embeddings: response.data.map((d) => d.embedding),
          model: response.model,
          providerKey: "OPENAI",
        };
      } catch (error) {
        throw new AiProviderError("OpenAI embedding request failed.", "OPENAI", error);
      }
    },
  };
}
