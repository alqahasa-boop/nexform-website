import Anthropic from "@anthropic-ai/sdk";
import { AI_MODELS } from "@/config/ai.config";
import { AiProviderError } from "../types";
import type {
  AiProvider,
  AiChatOptions,
  AiChatResult,
  AiChatChunk,
  AiVisionOptions,
  AiEmbeddingResult,
} from "../types";

function splitSystemMessage(messages: AiChatOptions["messages"]) {
  const system = messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n") || undefined;
  const rest = messages.filter((m) => m.role !== "system").map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
  return { system, rest };
}

export function createAnthropicProvider(apiKey: string): AiProvider {
  const client = new Anthropic({ apiKey });

  return {
    key: "ANTHROPIC",
    capabilities: { chat: true, vision: true, embedding: false },

    async chat({ messages, model, maxTokens, temperature }: AiChatOptions): Promise<AiChatResult> {
      try {
        const { system, rest } = splitSystemMessage(messages);
        const response = await client.messages.create({
          model: model ?? AI_MODELS.anthropic.chat,
          system,
          messages: rest,
          max_tokens: maxTokens ?? 1024,
          temperature: temperature ?? 0.4,
        });

        const textBlock = response.content.find((block) => block.type === "text");
        return {
          content: textBlock?.type === "text" ? textBlock.text : "",
          model: response.model,
          providerKey: "ANTHROPIC",
          tokensIn: response.usage?.input_tokens,
          tokensOut: response.usage?.output_tokens,
        };
      } catch (error) {
        throw new AiProviderError("Anthropic chat request failed.", "ANTHROPIC", error);
      }
    },

    async *chatStream({ messages, model, maxTokens, temperature }: AiChatOptions): AsyncGenerator<AiChatChunk> {
      try {
        const { system, rest } = splitSystemMessage(messages);
        const stream = client.messages.stream({
          model: model ?? AI_MODELS.anthropic.chat,
          system,
          messages: rest,
          max_tokens: maxTokens ?? 1024,
          temperature: temperature ?? 0.4,
        });

        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            yield { delta: event.delta.text, done: false };
          }
        }
        yield { delta: "", done: true };
      } catch (error) {
        throw new AiProviderError("Anthropic streaming chat request failed.", "ANTHROPIC", error);
      }
    },

    async analyzeImage({ imageUrl, prompt, model, maxTokens }: AiVisionOptions): Promise<AiChatResult> {
      try {
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) throw new Error(`Could not fetch image (${imageResponse.status}).`);
        const mediaType = imageResponse.headers.get("content-type") ?? "image/jpeg";
        const buffer = Buffer.from(await imageResponse.arrayBuffer());

        const response = await client.messages.create({
          model: model ?? AI_MODELS.anthropic.vision,
          max_tokens: maxTokens ?? 1024,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: mediaType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
                    data: buffer.toString("base64"),
                  },
                },
                { type: "text", text: prompt },
              ],
            },
          ],
        });

        const textBlock = response.content.find((block) => block.type === "text");
        return {
          content: textBlock?.type === "text" ? textBlock.text : "",
          model: response.model,
          providerKey: "ANTHROPIC",
          tokensIn: response.usage?.input_tokens,
          tokensOut: response.usage?.output_tokens,
        };
      } catch (error) {
        throw new AiProviderError("Anthropic image analysis request failed.", "ANTHROPIC", error);
      }
    },

    async embed(): Promise<AiEmbeddingResult> {
      throw new AiProviderError(
        "Anthropic does not offer an embeddings API — configure OpenAI (or another embedding-capable provider) for knowledge search.",
        "ANTHROPIC"
      );
    },
  };
}
