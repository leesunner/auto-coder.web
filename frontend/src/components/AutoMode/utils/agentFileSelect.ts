import eventBus, { EVENTS } from "@/services/eventBus";

export const useAgentFileSelect = () => {
  const subscribeToAgentFileSelect = (callback: (filePath: string) => void) => {
    return eventBus.subscribe(EVENTS.CHAT.FILE_SELECTED, callback);
  };

  const publishToAgentFileSelect = (filePath: string) => {
    if (filePath.includes(':')) {
      filePath = filePath.split(':')[1]?.trim?.()
    }
    if (!filePath) return
    eventBus.publish(EVENTS.CHAT.FILE_SELECTED, filePath);
  };

  return { subscribeToAgentFileSelect, publishToAgentFileSelect };
};
