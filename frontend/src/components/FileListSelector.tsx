
import React, { useState, useEffect, useRef, KeyboardEvent, useCallback } from 'react';
import { message } from 'antd';
import { PlusOutlined, CloseOutlined, SearchOutlined, FolderOutlined, FileOutlined } from '@ant-design/icons';
import { FileGroup, EnhancedCompletionItem } from './Sidebar/types';
import eventBus, { EVENTS } from '../services/eventBus';
import { FileMetadata } from '../types/file_meta';
import { getMessage } from '../lang';
import { FileGroupSelectionUpdatedEventData } from '../services/event_bus_data';
import { ServiceFactory } from '../services/ServiceFactory';
import './FileListSelector.css';

interface FileListSelectorProps {
  fileGroups: FileGroup[];
  selectedGroups: string[];
  setSelectedGroups: (values: string[]) => void;
  fetchFileGroups: () => void;
  mentionItems?: EnhancedCompletionItem[];
  panelId?: string;
}

interface FileCompletion {
  name: string;
  path: string;
  display: string;
  location?: string;
}

const FileListSelector: React.FC<FileListSelectorProps> = ({
  fileGroups,
  selectedGroups,
  setSelectedGroups,
  fetchFileGroups,
  panelId = '',
}) => {
  // 获取文件组服务
  const fileGroupService = ServiceFactory.getFileGroupService(panelId);
  
  // 状态管理
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [fileCompletions, setFileCompletions] = useState<FileCompletion[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');
  const [mentionFiles, setMentionFiles] = useState<{ path: string, display: string }[]>([]);
  const [tokenCount, setTokenCount] = useState<number>(0);
  const [openedFiles, setOpenedFiles] = useState<FileMetadata[]>([]);
  const [focusedOptionIndex, setFocusedOptionIndex] = useState<number>(-1);
  
  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const processedMentionPaths = useRef<Set<string>>(new Set());

  // 监听编辑器发来的聚焦事件
  useEffect(() => {
    const handleFocusEvent = () => {
      setIsDropdownOpen(true);
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        message.info(getMessage('focusInput'), 1);
      }
    };

    const unsubscribe = eventBus.subscribe(EVENTS.FILE_GROUP_SELECT.FOCUS, handleFocusEvent);
    return () => unsubscribe();
  }, []);

  // 监听编辑器发来的mentions变化事件
  useEffect(() => {
    const handleMentionsChanged = (mentions: Array<{ type: string; text: string; path: string }>) => {
      const fileOnlyMentions = mentions;
      if (fileOnlyMentions.length > 0) {
        const fileMentions = fileOnlyMentions.map(item => ({
          path: item.path,
          display: item.text
        }));

        setMentionFiles(fileMentions);
        processedMentionPaths.current = new Set(fileMentions.map(file => file.path));

        const mentionPaths = fileMentions.map(file => file.path);
        const newSelectedFiles = [...selectedFiles];
        let hasNewFiles = false;

        mentionPaths.forEach(path => {
          if (!newSelectedFiles.includes(path)) {
            newSelectedFiles.push(path);
            hasNewFiles = true;
          }
        });

        if (hasNewFiles) {
          updateSelection(selectedGroups, newSelectedFiles);
        }
      }
    };

    const unsubscribe = eventBus.subscribe(EVENTS.EDITOR.MENTIONS_CHANGED, handleMentionsChanged);
    return () => unsubscribe();
  }, [selectedGroups, selectedFiles]);

  // 订阅编辑器选项卡变更事件
  useEffect(() => {
    const unsubscribe = eventBus.subscribe(EVENTS.EDITOR.TABS_CHANGED, (tabs: FileMetadata[]) => {
      setOpenedFiles(tabs);
    });
    return () => unsubscribe();
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchText('');
        setFocusedOptionIndex(-1);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const formatPathDisplay = useCallback((path: string, maxLength: number = 40) => {
    const dirPath = path.substring(0, path.lastIndexOf('/'));
    return dirPath.length > maxLength ? '...' + dirPath.slice(-maxLength) : dirPath;
  }, []);

  const fetchFileCompletions = async (searchValue: string) => {
    if (searchValue.length < 2) {
      setFileCompletions([]);
      return;
    }

    try {
      const response = await fetch(`/api/completions/files?name=${encodeURIComponent(searchValue)}`);
      const data = await response.json();
      setFileCompletions(data.completions || []);
    } catch (error) {
      console.error(getMessage('errorFetchingCompletions'), error);
    }
  };

  const updateSelection = (groupValues: string[], fileValues: string[]) => {
    const uniqueGroupValues = Array.from(new Set(groupValues));
    const uniqueFileValues = Array.from(new Set(fileValues));

    setSelectedGroups(uniqueGroupValues);
    setSelectedFiles(uniqueFileValues);

    fileGroupService.switchFileGroups(uniqueGroupValues, uniqueFileValues)
      .then((result: { success: boolean; totalTokens: number; message: string }) => {
        if (result.totalTokens !== undefined) {
          setTokenCount(result.totalTokens);
        }

        eventBus.publish(
          EVENTS.FILE_GROUP_SELECT.SELECTION_UPDATED,
          new FileGroupSelectionUpdatedEventData(uniqueGroupValues, uniqueFileValues, panelId)
        );
      })
      .catch((error: Error) => {
        console.error(getMessage('errorUpdatingSelection'), error);
      });
  };

  // 处理键盘导航
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isDropdownOpen) return;

    const totalOptions = fileCompletions.length +
      (openedFiles.length > 0 && searchText.length < 2 ? openedFiles.length : 0) +
      (mentionFiles.length > 0 && searchText.length < 2 ? mentionFiles.length : 0) +
      fileGroups.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (totalOptions === 0) return;
        setFocusedOptionIndex(prev => prev >= totalOptions - 1 ? 0 : prev + 1);
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (totalOptions === 0) return;
        setFocusedOptionIndex(prev => prev <= 0 ? totalOptions - 1 : prev - 1);
        break;

      case 'Enter':
        if (focusedOptionIndex >= 0) {
          e.preventDefault();
          selectFocusedOption(focusedOptionIndex);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsDropdownOpen(false);
        setSearchText('');
        setFocusedOptionIndex(-1);
        break;
    }
  };

  // 选择当前聚焦的选项
  const selectFocusedOption = (index: number) => {
    let optionIndex = index;
    let selectedValue: string = '';

    if (fileCompletions.length > 0 && optionIndex < fileCompletions.length) {
      selectedValue = fileCompletions[optionIndex].path;
    } else {
      optionIndex -= fileCompletions.length;

      if (openedFiles.length > 0 && searchText.length < 2 && optionIndex < openedFiles.length) {
        selectedValue = openedFiles[optionIndex].path;
      } else {
        optionIndex -= (openedFiles.length > 0 && searchText.length < 2 ? openedFiles.length : 0);

        if (mentionFiles.length > 0 && searchText.length < 2 && optionIndex < mentionFiles.length) {
          selectedValue = mentionFiles[optionIndex].path;
        } else {
          optionIndex -= (mentionFiles.length > 0 && searchText.length < 2 ? mentionFiles.length : 0);

          if (optionIndex < fileGroups.length) {
            selectedValue = fileGroups[optionIndex].name;
          }
        }
      }
    }

    if (selectedValue) {
      const isGroup = fileGroups.some(group => group.name === selectedValue);

      if (isGroup) {
        const updatedGroups = [...selectedGroups];
        if (!updatedGroups.includes(selectedValue)) {
          updatedGroups.push(selectedValue);
        }
        updateSelection(updatedGroups, selectedFiles);
      } else {
        const updatedFiles = [...selectedFiles];
        if (!updatedFiles.includes(selectedValue)) {
          updatedFiles.push(selectedValue);
        }
        updateSelection(selectedGroups, updatedFiles);
      }

      setIsDropdownOpen(false);
      setSearchText('');
      setFocusedOptionIndex(-1);
    }
  };

  // 处理选项点击
  const handleOptionClick = (value: string, isGroup: boolean) => {
    if (isGroup) {
      const updatedGroups = [...selectedGroups];
      if (!updatedGroups.includes(value)) {
        updatedGroups.push(value);
      }
      updateSelection(updatedGroups, selectedFiles);
    } else {
      const updatedFiles = [...selectedFiles];
      if (!updatedFiles.includes(value)) {
        updatedFiles.push(value);
      }
      updateSelection(selectedGroups, updatedFiles);
    }

    setIsDropdownOpen(false);
    setSearchText('');
    setFocusedOptionIndex(-1);
  };

  // 移除选中项
  const removeSelectedItem = (value: string) => {
    const isGroup = fileGroups.some(group => group.name === value);
    
    if (isGroup) {
      const updatedGroups = selectedGroups.filter(group => group !== value);
      updateSelection(updatedGroups, selectedFiles);
    } else {
      const updatedFiles = selectedFiles.filter(file => file !== value);
      updateSelection(selectedGroups, updatedFiles);
    }
  };

  // 清空所有选择
  const clearAllSelections = async () => {
    try {
      const result: { success: boolean; message: string } = await fileGroupService.clearCurrentFiles();
      if (result.success) {
        setSelectedGroups([]);
        setSelectedFiles([]);
        fetchFileGroups();
      }
    } catch (error: unknown) {
      console.error(getMessage('clearFailed'), error);
    }
  };

  // 格式化token数量显示
  const formatTokenCount = (count: number): string => {
    return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // 渲染选中的标签
  const renderSelectedTags = () => {
    const allSelected = [...selectedGroups, ...selectedFiles];
    
    return allSelected.map((value) => {
      const isGroup = selectedGroups.includes(value);
      let fileName = value;
      
      if (!isGroup) {
        if (value.includes("/")) {
          fileName = value.split("/").pop() || value;
        } else if (value.includes("\\")) {
          fileName = value.split("\\").pop() || value;
        }
      }

      return (
        <span
          key={value}
          className={`selected-tag ${isGroup ? 'file-group' : 'file-item'}`}
          title={value}
        >
          {isGroup ? (
            <FolderOutlined className="tag-icon" />
          ) : (
            <FileOutlined className="tag-icon" />
          )}
          <span className="tag-text">{fileName}</span>
          <CloseOutlined
            className="tag-close"
            onClick={() => removeSelectedItem(value)}
          />
        </span>
      );
    });
  };

  // 渲染下拉选项
  const renderDropdownOptions = () => {
    let optionIndex = 0;
    const options: JSX.Element[] = [];

    // 搜索结果
    if (fileCompletions.length > 0) {
      options.push(
        <div key="search-group" className="option-group-title">
          {getMessage('searchResults')}
        </div>
      );
      
      fileCompletions.forEach((file, index) => {
        const isFocused = focusedOptionIndex === optionIndex;
        options.push(
          <div
            key={`search-${file.path}`}
            className={`option-item ${isFocused ? 'focused' : ''}`}
            onClick={() => handleOptionClick(file.path, false)}
          >
            <div className="option-content" title={file.path}>
              <div className="option-main">
                {file.display} ({formatPathDisplay(file.path)})
              </div>
              <div className="option-badge">{getMessage('fileType')}</div>
            </div>
          </div>
        );
        optionIndex++;
      });
    }

    // 已打开文件
    if (openedFiles.length > 0 && searchText.length < 2) {
      options.push(
        <div key="opened-group" className="option-group-title">
          {getMessage('openedFiles')}
        </div>
      );
      
      openedFiles.forEach((file, index) => {
        const isFocused = focusedOptionIndex === optionIndex;
        const display = file.label || file.path.split('/').pop() || file.path;
        
        options.push(
          <div
            key={`opened-${file.path}`}
            className={`option-item ${isFocused ? 'focused' : ''}`}
            onClick={() => handleOptionClick(file.path, false)}
          >
            <div className="option-content" title={file.path}>
              <div className={`option-main ${file.isSelected ? 'font-medium' : ''}`}>
                {display} ({formatPathDisplay(file.path)})
              </div>
              <div className={`option-badge ${file.isSelected ? 'text-green-400' : 'text-green-600/70'}`}>
                {getMessage(file.isSelected ? 'fileStatusActive' : 'fileStatusOpened')}
              </div>
            </div>
          </div>
        );
        optionIndex++;
      });
    }

    // 提到的文件
    if (mentionFiles.length > 0 && searchText.length < 2) {
      options.push(
        <div key="mention-group" className="option-group-title">
          {getMessage('mentionedFiles')}
        </div>
      );
      
      mentionFiles.forEach((file, index) => {
        const isFocused = focusedOptionIndex === optionIndex;
        
        options.push(
          <div
            key={`mention-${file.path}`}
            className={`option-item ${isFocused ? 'focused' : ''}`}
            onClick={() => handleOptionClick(file.path, false)}
          >
            <div className="option-content" title={file.path}>
              <div className="option-main">
                {file.display} ({formatPathDisplay(file.path, 20)})
              </div>
              <div className="option-badge text-blue-400">{getMessage('mentionedFileStatus')}</div>
            </div>
          </div>
        );
        optionIndex++;
      });
    }

    // 文件组
    if (fileGroups.length > 0) {
      options.push(
        <div key="groups-header" className="option-group-title">
          文件组
        </div>
      );
      
      fileGroups.forEach((group, index) => {
        const isFocused = focusedOptionIndex === optionIndex;
        
        options.push(
          <div
            key={`group-${group.name}`}
            className={`option-item ${isFocused ? 'focused' : ''}`}
            onClick={() => handleOptionClick(group.name, true)}
          >
            <div className="option-content">
              <div className="option-main">{group.name}</div>
              <div className="option-badge">
                {getMessage('fileCount', { count: String(group.files.length) })}
              </div>
            </div>
          </div>
        );
        optionIndex++;
      });
    }

    return options;
  };

  return (
    <div className="file-list-selector px-1 w-full" onKeyDown={handleKeyDown}>
      <div className="h-[1px] bg-gray-700/50 my-0.5 w-full"></div>
      
      {/* Token 计数显示 */}
      <div className="flex items-center justify-between w-full mb-1">
        <span className="text-xs text-gray-400 flex items-center">
          <span className="mr-1">Tokens:</span>
          <span className="font-medium text-green-400">{formatTokenCount(tokenCount)}</span>
        </span>
      </div>

      {/* 选中的标签显示区域 */}
      <div className="tags-container flex flex-wrap items-center gap-1 min-h-[32px] mb-2 p-2 bg-gray-800 rounded border border-gray-600">
        {renderSelectedTags()}
        
        {/* + 号按钮 */}
        <button
          className="action-button add-button"
          onClick={() => {
            setIsDropdownOpen(!isDropdownOpen);
            fetchFileGroups();
            setTimeout(() => {
              if (searchInputRef.current) {
                searchInputRef.current.focus();
              }
            }, 100);
          }}
          title="添加文件或文件组"
        >
          <PlusOutlined />
        </button>

        {/* 清空按钮 */}
        {(selectedGroups.length > 0 || selectedFiles.length > 0) && (
          <button
            className="action-button clear-button"
            onClick={clearAllSelections}
            title={getMessage('clearContext')}
          >
            <CloseOutlined />
          </button>
        )}
      </div>

      {/* 下拉选择层 */}
      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          className="dropdown-container"
          style={{ top: '100%', left: 0, right: 0 }}
        >
          {/* 搜索框 */}
          <div className="search-container">
            <div className="relative">
              <SearchOutlined className="search-icon" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  fetchFileCompletions(e.target.value);
                  setFocusedOptionIndex(-1);
                }}
                placeholder="搜索文件..."
                className="search-input"
              />
            </div>
          </div>

          {/* 选项列表 */}
          <div className="options-container">
            {renderDropdownOptions()}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileListSelector;
