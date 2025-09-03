import type { Message } from "@/components/AutoMode/types";

type LLMMessage = {
  type: string;
  content: string;
  contentType: string;
  isThinking: boolean;
  isStreaming: boolean;
};

class LLMResponseParser {
  static parse(
    input: string,
    keepOriginal: boolean = false
  ): LLMMessage | null {
    // 解析<thinking>标签
    // this.parseThinkingTags(input, results);

    // 解析<tool_result>标签
    const results = this.parseToolResultTags(input);

    return results || null;
  }

  static parseReaderFile(input: string) {
    const thinkingRegex =
      /<read_file>\\n?<path>([\s\S]*?)<\/path>\\n?<\/read_file>/g;
    let match;
    const res = thinkingRegex.exec(input);
    while ((match = res) !== null) {
      return {
        type: "STREAM",
        content: JSON.stringify({
          tool_name: "ReadFileTool",
          success: true,
          message: match[1].trim() || "",
          content: {
            content: "",
          },
        }),
        contentType: "text",
        isThinking: false,
        isStreaming: false,
      };
    }
  }

  static parseThinkingTags(input: string) {
    const thinkingRegex = /<thinking>([\s\S]*?)<\/thinking>/g;
    let match;
    const res = thinkingRegex.exec(input);
    while ((match = res) !== null) {
      return {
        type: "STREAM",
        content: match[1].trim(),
        contentType: "text",
        isThinking: true,
        isStreaming: false,
      };
    }
  }

  static parseToolResultTags(input: string) {
    const toolResultRegex =
      /<tool_([a-z_]+)[^>]*tool_name=['"]([^'"]*)['"][^>]*success=['"]([^'"]*)['"][^>]*>([\s\S]*?)<\/tool_result>/g;
    const match = toolResultRegex.exec(input);
    if (match === null) return input;

    const type = match[1].toLocaleUpperCase();
    const toolName = match[2];
    const success = match[3] === "true";
    const content = match[4];

    const messageMatch = content.match(/<message>([\s\S]*?)<\/message>/);
    const contentMatch = content.match(/<content>([\s\S]*?)<\/content>/);

    return {
      type,
      content: JSON.stringify({
        tool_name: toolName,
        success: success,
        message: messageMatch ? messageMatch[1].trim() : "",
        content: {
          content: contentMatch ? contentMatch[1].trim() : "",
        },
      }),
      contentType: "text",
      isThinking: false,
      isStreaming: false,
      metadata: { path: "" },
    };
  }
}

export { LLMResponseParser };
