# 推荐方式：使用全局获取方法
from autocoder.common.conversations.get_conversation_manager import (
    get_conversation_manager,
)
from loguru import logger

# 获取管理器实例（使用默认配置）
manager = get_conversation_manager()


def get_conversation_id() -> str:
    """
    获取当前会话ID
    """
    return manager.get_current_conversation_id()


def create_conversation(name: str, description: str) -> str:
    """
    创建会话
    """
    conversation_id = manager.create_conversation(name, description)
    return conversation_id


def set_current_conversation(conversation_id: str):
    """
    设置当前会话
    """
    manager.set_current_conversation(conversation_id)


def create_and_set_conversation(name: str, description: str) -> str:
    """
    创建并设置会话
    """
    conversation_id = create_conversation(name, description)
    set_current_conversation(conversation_id)
    return conversation_id


def delete_conversation(conversation_id: str):
    """
    删除会话
    """
    manager.delete_conversation(conversation_id)


def update_conversation(conversation_id: str, name: str, description: str = None):
    manager.update_conversation(conversation_id, name, description)


def get_messages_by_conversationId(conversation_id: str):
    conversation_data = manager.get_conversation(conversation_id)
    logger.info(f"Get messages by conversationId: {conversation_data}")
    if conversation_data:
        return conversation_data["messages"]
    return []
