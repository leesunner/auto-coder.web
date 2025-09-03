from auto_coder_web.common_router.chat_conversations_manager import (
    create_and_set_conversation,
    get_messages_by_conversationId,
    set_current_conversation,
)

from fastapi import APIRouter, HTTPException, Request, Depends

from auto_coder_web.types import ChatCreateConversation

from loguru import logger

from pydantic import BaseModel


class ConversationData(BaseModel):
    conversation_id: str


async def get_project_path(request: Request) -> str:
    """
    从FastAPI请求上下文中获取项目路径
    """
    return request.app.state.project_path


router = APIRouter()


@router.post("/api/chat/create-conversations")
async def create_and_set_conversation_endpoint(
    chat_create_data: ChatCreateConversation,
    # project_path: str = Depends(get_project_path),
):
    """
    创建会话id，并设置为当前会话id
    """
    try:
        logger.info(f"Creating conversation: {chat_create_data.name}")

        # 调用管理模块保存聊天列表，支持 metadata, conversation_id
        conversation_id = create_and_set_conversation(
            chat_create_data.name, chat_create_data.description
        )

        logger.info(f"Conversation created successfully with ID: {conversation_id}")
        return {"status": "success", "conversation_id": conversation_id}

    except ValueError as e:
        logger.error(f"Invalid data for conversation creation: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/api/chat/set-conversations")
async def update_current_conversation_id(data: ConversationData):
    """
    更新当前会话id
    """
    try:
        set_current_conversation(data.conversation_id)
        return {"status": "success", "message": "设置成功"}
    except ValueError as e:
        logger.error(f"Invalid data for conversation set: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error set conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/api/get-messages/by-conversationId/{id}")
async def get_messages_by_conversation_id(id: str):
    """
    获取会话messages
    """
    try:
        messages = get_messages_by_conversationId(id)
        return {"status": "success", "messages": messages}
    except ValueError as e:
        logger.error(f"Invalid data for conversation set: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error set conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
