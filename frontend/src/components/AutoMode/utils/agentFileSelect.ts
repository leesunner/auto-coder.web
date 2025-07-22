import eventBus, { EVENTS } from "@/services/eventBus";

const fileReg = /([A-Za-z\d.@_-]+\/)+[A-Za-z\d.@_-]+\.[a-zA-z]+/gm;

export const useAgentFileSelect = () => {
  const subscribeToAgentFileSelect = (callback: (filePath: string) => void) => {
    return eventBus.subscribe(EVENTS.CHAT.FILE_SELECTED, callback);
  };

  const getPath = (filePath: string) => {
    if (!filePath) return;
    fileReg.lastIndex = 0;
    const list = filePath.match(fileReg);
    if (!list) return;
    return list[list.length - 1];
  };

  const publishToAgentFileSelect = (filePath: string) => {
    filePath = getPath(filePath) as string;
    if (!filePath) return;
    filePath = filePath.trim();

    console.log("选中路径：", filePath);
    eventBus.publish(EVENTS.CHAT.FILE_SELECTED, filePath);
  };

  return { subscribeToAgentFileSelect, publishToAgentFileSelect };
};
