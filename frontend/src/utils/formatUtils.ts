/**
 * Formats a number with commas as thousands separators.
 * @param num The number to format.
 * @returns A formatted string representation of the number.
 */
export function formatNumberWithCommas(num: number | string): string {
  if (typeof num === "string") {
    num = parseFloat(num);
    if (isNaN(num)) {
      return ""; // Or handle error as appropriate
    }
  }
  return num.toLocaleString();
}

/**
 * Renders a string template by replacing placeholders like {{key}} with values from the params object.
 * @param template The template string.
 * @param params An object containing key-value pairs for replacement.
 * @returns The rendered string.
 */
export function renderStringTemplate(
  template: string,
  params: { [key: string]: any }
): string {
  if (!template) return "";
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params.hasOwnProperty(key) ? String(params[key]) : match;
  });
}

/**
 * Formats a number representing bytes into a human-readable string (KB, MB, GB, etc.).
 * @param bytes The number of bytes.
 * @param decimals The number of decimal places to display (default: 2).
 * @returns A human-readable file size string.
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Formats a number to a specified number of decimal places.
 * @param num The number to format.
 * @param precision The number of decimal places to keep (default: 2).
 * @returns A string representation of the number with the specified precision.
 */
export function formatNumberToFixed(
  num: number | string,
  precision: number = 2
): string {
  let numericValue: number;

  if (typeof num === "string") {
    numericValue = parseFloat(num);
    if (isNaN(numericValue)) {
      return ""; // Or handle error as appropriate, e.g., return 'NaN' or throw error
    }
  } else {
    numericValue = num;
  }

  if (typeof numericValue !== "number" || isNaN(numericValue)) {
    return ""; // Handle cases where conversion might still fail or input was not a number
  }

  const effectivePrecision = precision < 0 ? 0 : precision;
  return numericValue.toFixed(effectivePrecision);
}

/**
 * 将对象参数querystring
 */
export function queryToString(data: Record<string, any>) {
  if (!data) return "";
  const keys = Object.keys(data);
  if (!keys.length) return "";
  const _str = keys.reduce((pre, key) => {
    return `${pre}${key}=${data[key] === undefined ? "" : data[key]}&`;
  }, "?");
  return _str.slice(0, _str.length - 1);
}

/**
 * 统计消息的token使用情况
 * @param messages
 * @returns
 */
export function formatterMessageMetadata(messages: any[]) {
  let inputTokens = 0;
  let outputTokens = 0;
  let totalCost = 0;
  let contextWindowUsage = 0;
  let maxContextWindow = 0;
  let cacheHits = 0;
  let cacheMisses = 0;

  // 遍历所有消息，累计token统计
  (messages || []).forEach((message) => {
    if (message.contentType === "token_stat" && message.metadata) {
      inputTokens += message.metadata.input_tokens || 0;
      outputTokens += message.metadata.output_tokens || 0;
      totalCost +=
        (message.metadata.input_cost || 0) +
        (message.metadata.output_cost || 0);
      contextWindowUsage = Math.max(
        contextWindowUsage,
        message.metadata.context_window || 0
      );
      maxContextWindow =
        message.metadata.max_context_window || maxContextWindow;
      cacheHits += message.metadata.cache_hit || 0;
      cacheMisses += message.metadata.cache_miss || 0;
    }

    if (
      message.metadata?.stream_out_type === "index_build" &&
      message.metadata?.input_tokens
    ) {
      inputTokens += message.metadata.input_tokens || 0;
      outputTokens += message.metadata.output_tokens || 0;
      totalCost +=
        (message.metadata.input_cost || 0) +
        (message.metadata.output_cost || 0);
      contextWindowUsage = Math.max(
        contextWindowUsage,
        message.metadata.context_window || 0
      );
      maxContextWindow =
        message.metadata.max_context_window || maxContextWindow;
      cacheHits += message.metadata.cache_hit || 0;
      cacheMisses += message.metadata.cache_miss || 0;
    }

    if (message.metadata?.path === "/agent/edit/window_length_change") {
      const content = JSON.parse(message.content);
      contextWindowUsage = content.tokens_used;
    }
  });
  return {
    inputTokens,
    outputTokens,
    totalCost,
    contextWindowUsage,
    maxContextWindow,
    cacheHits,
    cacheMisses,
  };
}
