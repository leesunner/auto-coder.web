import eventBus, { EVENTS } from "@/services/eventBus";

export const useAgentFileSelect = () => {
  const subscribeToAgentFileSelect = (callback: (filePath: string) => void) => {
    return eventBus.subscribe(EVENTS.CHAT.FILE_SELECTED, callback);
  };

  const publishToAgentFileSelect = (filePath: string) => {
    let needFomart = false
    if (filePath.includes('：')) {
      needFomart = true
      filePath = filePath.split('：')[1]
    }
    if (filePath.includes(':')) {
      needFomart = true
      filePath = filePath.split(':')[1]
    }
    if (!filePath) return

    filePath = filePath.trim()
    
    if (needFomart) {
      /**
       * 处理类似这种文本提取文件路径
       * 成功应用了 1/1 个更改到文件：frontend/src/components/AutoMode/MessageTypes/AgenticEditReadFileTool.tsx。
       * 
       *  */ 
      filePath = filePath.slice(0, filePath.length - 1)
    }

    console.log(filePath)
    eventBus.publish(EVENTS.CHAT.FILE_SELECTED, filePath);
  };

  return { subscribeToAgentFileSelect, publishToAgentFileSelect };
};
