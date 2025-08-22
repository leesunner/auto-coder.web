import React, { useState, useEffect, useRef } from 'react';
import { JsonExtractor } from '../../services/JsonExtractor';
import { Modal, Input, Select, DatePicker, Button, Tag, message as AntMessage } from 'antd';
import { PlusOutlined, SplitCellsOutlined } from '@ant-design/icons';
import { getMessage } from '../../lang';
import { useTaskSplitting } from '../../contexts/TaskSplittingContext';
import moment from 'moment';
import { autoCommandService } from '../../services/autoCommandService';

const { TextArea } = Input;
const { Option } = Select;

interface Dependency {
  task: string;
  depends_on: string[];
}

interface TodoItem {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'developing' | 'testing' | 'done';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  tags: string[];
  owner?: string;
  dueDate?: string;
  created_at: string;
  updated_at: string;
  analysis?: string;
  dependencies?: Dependency[];
  tasks?: any[];
}

interface TodoEditModalProps {
  visible: boolean;
  todo: TodoItem | null;
  onClose: () => void;
  onSave: (todo: TodoItem) => Promise<void>;
}

const TodoEditModal: React.FC<TodoEditModalProps> = ({
  visible,
  todo,
  onClose,
  onSave
}) => {
  const [editedTodo, setEditedTodo] = useState<Partial<TodoItem>>({});
  const [loading, setLoading] = useState(false);
  const [inputTag, setInputTag] = useState('');
  const [splitLoading, setSplitLoading] = useState(false);
  
  const eventListenerRef = useRef<boolean>(false);
  
  const isValidTaskSplitResponse = (msgEvent: any): boolean => {
    return msgEvent.contentType === 'summary' || msgEvent.metadata?.command === 'response_user';
  };

  const parseTaskSplitResult = (msgEvent: any): any => {
    if (msgEvent.contentType === 'summary' && typeof msgEvent.content === 'string') {
      return JsonExtractor.extract(msgEvent.content) || msgEvent.content;
    } else if (msgEvent.contentType === 'summary' && typeof msgEvent.content === 'object') {
      return msgEvent.content;
    } else {
      return msgEvent.metadata?.parameters.response;
    }
  };
  
  useEffect(() => {
    if (todo) {
      setEditedTodo(todo);
    } else {
      setEditedTodo({});
    }
  }, [todo]);

  useEffect(() => {
    const handleTaskSplitResult = (msgEvent: any) => {
      
      if (isValidTaskSplitResponse(msgEvent)) {
        console.log('Task split result:', msgEvent);
        AntMessage.success(getMessage('taskSplitSuccess', { count: '0' }));
        setSplitLoading(false);
        onClose();
        
        autoCommandService.removeListener('message', handleTaskSplitResult);
        eventListenerRef.current = false;
      }
    };

    return () => {
      if (eventListenerRef.current) {
        autoCommandService.removeListener('message', handleTaskSplitResult);
        eventListenerRef.current = false;
      }
    };
  }, [onClose]);

  const handleSave = async () => {
    if (!editedTodo.title) {
      AntMessage.error(getMessage('todoTitleRequired'));
      return;
    }
    
    setLoading(true);
    try {
      if (todo && editedTodo) {
        await onSave({
          ...todo,
          ...editedTodo,
        } as TodoItem);
      }
      onClose();
    } catch (error) {
      console.error(getMessage('failedToSaveTodo'), error);
      AntMessage.error(getMessage('failedToSaveTodo'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (inputTag && editedTodo.tags && !editedTodo.tags.includes(inputTag)) {
      setEditedTodo({
        ...editedTodo,
        tags: [...editedTodo.tags, inputTag]
      });
      setInputTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    if (editedTodo.tags) {
      setEditedTodo({
        ...editedTodo,
        tags: editedTodo.tags.filter(t => t !== tag)
      });
    }
  };

  // 使用 TaskSplittingContext 获取和设置任务拆解状态
  const {
    splittingTodoId,
    setSplittingTodoId,
    setLastSplitResult,
    setSplitCompleted,
    setLastSplitTodoId
  } = useTaskSplitting();

  const handleSplitTask = async () => {
    if (!editedTodo.title || !editedTodo.description) {
      AntMessage.error(getMessage('todoDescriptionRequired'));
      return;
    }

    // 检查是否已有任务正在拆解
    if (splittingTodoId) {
      AntMessage.error(getMessage('taskSplittingInProgress'));
      return;
    }

    setSplitLoading(true);
    
    try {            
      // 1. 构建AI提示
      const prompt = getMessage('taskSplitPromptTemplate', {
        title: editedTodo.title,
        description: editedTodo.description,
        priority: editedTodo.priority || 'P2'
      });

      const command = `split_task ${JSON.stringify(prompt)}`;
      
      // 保存任务到服务器，标记为正在拆解
      if (todo) {
        try {
          // 标记该任务正在拆解
          setSplittingTodoId(todo.id);                                        
          onClose();
        } catch (error) {
          console.error('Failed to update task status:', error);
          AntMessage.warning(getMessage('failedToSaveTodo'));
          // 即使保存失败也继续拆解任务
        }
      } else {
        // 如果是新任务，也关闭对话框
        onClose();
      }
      
      // 设置事件监听器
      const handleTaskSplitResult = (msgEvent: any) => {        
        if (isValidTaskSplitResponse(msgEvent)) {
          console.log('Task split result:', msgEvent);
          let tasksCount = 0;
          let splitResult: any = null;
          
          try {            
            splitResult = parseTaskSplitResult(msgEvent);
             
            // 保存完整的拆分结果到Context
            if (splitResult) {
              setLastSplitResult(splitResult);
              console.log('Split result saved to TodoPanel:', splitResult);
              
              // 从结果中获取任务数量
              tasksCount = splitResult.tasks_count || splitResult.tasks?.length || 0;
              
              // 如果有todo对象，将任务拆分结果保存到后端
              if (todo && todo.id) {
                // 1. 准备要提交给后端的数据
                const tasksForBackend = splitResult.tasks?.map((task: any, index: number) => ({
                  id: index , // 根据序号生成id
                  title: task.title,
                  description: task.description || null,
                  references: Array.isArray(task.references) ? task.references : [],
                  steps: Array.isArray(task.steps) ? task.steps : [],
                  acceptance_criteria: Array.isArray(task.acceptance_criteria) ? task.acceptance_criteria : [],
                  priority: task.priority || todo.priority,
                  estimate: task.estimate || null
                })) || [];
                
                const updatedTodoData = {
                  ...todo,
                  tasks: tasksForBackend,
                  status: 'developing',
                  tags: [...(todo.tags || [])].filter(tag => tag !== getMessage('splittingTag')).concat([getMessage('splitCompletedTag')]),
                  analysis: splitResult.analysis || null,
                  dependencies: splitResult.dependencies || null
                };
                
                // 2. 调用API保存到后端
                fetch(`/api/todos/${todo.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updatedTodoData)
                })
                .then(response => {
                  if (!response.ok) {
                    throw new Error(getMessage('failedToSaveTodo'));
                  }
                  return response.json();
                })
                .then(() => {
                  console.log('Task split result saved to backend successfully');
                  
                  // 使用Context标记拆解已完成
                  setSplitCompleted(true);
                  setLastSplitTodoId(todo.id);
                  
                  // 清除正在拆解的标记
                  setSplittingTodoId(null);
                  
                  // 通知父组件更新任务（移除"正在拆解"标签，添加"已拆解"标签）
                  const updatedTodoWithNewTags = {
                    ...todo,
                    tags: [...(todo.tags || [])].filter(tag => tag !== getMessage('splittingTag')).concat([getMessage('splitCompletedTag')]),
                    analysis: splitResult.analysis || null,
                    dependencies: splitResult.dependencies || null,
                    tasks: tasksForBackend
                  } as TodoItem;
                  
                  onSave(updatedTodoWithNewTags);
                })
                .catch(error => {
                  console.error('Failed to save split result to backend:', error);
                  AntMessage.warning(getMessage('failedToSaveTodo'));
                });
              }
            }
          } catch (e) {
            console.error('Error parsing task result:', e);
          }
          
          AntMessage.success(getMessage('taskSplitSuccess', { count: String(tasksCount) }));
          // 不在这里设置加载状态，交给taskComplete事件处理
        }
      };

      // 处理任务完成事件（无论成功或失败）
      const handleTaskComplete = (hasError: boolean) => {
        console.log('Task complete event received, has error:', hasError);
        
        // 结束加载状态
        setSplitLoading(false);
        
        // 如果有错误且之前没有显示过成功消息
        if (hasError) {
          AntMessage.error(getMessage('failedToSplitTask'));
        }
        
        // 清除拆分中的任务ID
        setSplittingTodoId(null);
        
        // 清理所有事件监听
        autoCommandService.removeListener('message', handleTaskSplitResult);
        autoCommandService.removeListener('taskComplete', handleTaskComplete);
        eventListenerRef.current = false;
      };
      
      // 注册事件监听
      autoCommandService.on('message', handleTaskSplitResult);
      autoCommandService.on('taskComplete', handleTaskComplete);
      eventListenerRef.current = true;
      
      // 6. 执行AI拆分命令
      await autoCommandService.executeCommand(command);
      
    } catch (error) {
      console.error(getMessage('failedToSplitTask'), error);
      AntMessage.error(getMessage('failedToSplitTask'));
      setSplitLoading(false);
      onClose(); // 确保对话框关闭
      
      // 清理事件监听
      if (eventListenerRef.current) {
        autoCommandService.removeListener('message', function() {});
        autoCommandService.removeListener('taskComplete', function() {});
        eventListenerRef.current = false;
      }
    }
  };

  const priorityOptions = [
    { value: 'P0', label: getMessage('priorityP0') },
    { value: 'P1', label: getMessage('priorityP1') },
    { value: 'P2', label: getMessage('priorityP2') },
    { value: 'P3', label: getMessage('priorityP3') },
  ];

  return (
    <Modal
      title={getMessage('editTodoTitle')}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="split" 
          type="default" 
          icon={<SplitCellsOutlined />} 
          loading={splitLoading}
          onClick={handleSplitTask}
          className="bg-purple-700 hover:bg-purple-800 border-none text-white"
        >
          {getMessage('splitTask')}
        </Button>,
        <Button key="cancel" onClick={onClose}>
          {getMessage('cancel')}
        </Button>,
        <Button 
          key="save" 
          type="primary" 
          loading={loading} 
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 border-none"
        >
          {getMessage('save')}
        </Button>
      ]}
      className="dark-theme-modal"
      styles={{
        content: {
          backgroundColor: '#1f2937',
          padding: '20px',
        },
        header: {
          backgroundColor: '#1f2937',
          borderBottom: '1px solid #374151',
        },
        body: {
          backgroundColor: '#1f2937',
        }
      }}
      width={700}
    >
      <div className="mb-4">
        <label className="block text-gray-300 mb-1">{getMessage('todoTitle')}</label>
        <Input
          value={editedTodo.title}
          onChange={(e) => setEditedTodo({...editedTodo, title: e.target.value})}
          placeholder={getMessage('todoTitlePlaceholder')}
          className="custom-input bg-gray-800 border-gray-700 text-gray-200"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-1">{getMessage('todoDescription')}</label>
        <TextArea
          value={editedTodo.description}
          onChange={(e) => setEditedTodo({...editedTodo, description: e.target.value})}
          placeholder={getMessage('todoDescriptionPlaceholder')}
          rows={6}
          className="custom-input bg-gray-800 border-gray-700 text-gray-200"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">{getMessage('priority')}</label>
          <Select
            value={editedTodo.priority}
            onChange={(value) => setEditedTodo({...editedTodo, priority: value})}
            options={priorityOptions}
            className="custom-select w-full"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-300 mb-1">{getMessage('dueDate')}</label>
          <DatePicker
            value={editedTodo.dueDate ? moment(editedTodo.dueDate) : undefined}
            onChange={(date) => setEditedTodo({...editedTodo, dueDate: date ? date.toISOString() : undefined})}
            className="custom-input bg-gray-800 border-gray-700 text-gray-200 w-full"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-1">{getMessage('tags')}</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {editedTodo.tags?.map(tag => (
            <Tag
              key={tag}
              closable
              onClose={() => handleRemoveTag(tag)}
              className="text-xs bg-gray-700 border-none text-gray-300 rounded-full px-3 py-1"
            >
              {tag}
            </Tag>
          ))}
        </div>
        <div className="flex">
          <Input
            value={inputTag}
            onChange={(e) => setInputTag(e.target.value)}
            placeholder={getMessage('addTagPlaceholder')}
            className="custom-input bg-gray-800 border-gray-700 text-gray-200 flex-1 mr-2"
            onPressEnter={handleAddTag}
          />
          <Button
            icon={<PlusOutlined />}
            onClick={handleAddTag}
            className="bg-gray-700 hover:bg-gray-600 border-none text-gray-200"
          >
            {getMessage('addTag')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TodoEditModal; 