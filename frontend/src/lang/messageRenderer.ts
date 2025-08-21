

interface Message {
  en: string;
  zh: string;
}

export const messageRendererMessages: { [key: string]: Message } = {
  // MessageRenderer 相关的多语言配置
  summary: {
    en: "Summary",
    zh: "摘要"
  },
  sending: {
    en: "sending",
    zh: "发送中"
  },
  sent: {
    en: "sent",
    zh: "已发送"
  },
  failedToSend: {
    en: "failed to send",
    zh: "发送失败"
  }
};

