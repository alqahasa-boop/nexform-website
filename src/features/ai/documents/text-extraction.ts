import { extractText as extractPdfText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";

export interface ExtractionResult {
  text: string;
  pageCount?: number;
}

/** Real text extraction — no AI provider involved, works today regardless of AI configuration. */
export async function extractTextFromFile(buffer: Buffer, mimeType: string): Promise<ExtractionResult> {
  if (mimeType === "application/pdf") {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { text, totalPages } = await extractPdfText(pdf, { mergePages: true });
    return { text: Array.isArray(text) ? text.join("\n") : text, pageCount: totalPages };
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    const { value } = await mammoth.extractRawText({ buffer });
    return { text: value };
  }

  throw new Error(`Text extraction is not supported for MIME type "${mimeType}".`);
}
