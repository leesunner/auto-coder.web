
import React, { useMemo, useCallback } from 'react';
import { FolderOutlined, TeamOutlined } from '@ant-design/icons';
import VirtualList, { VirtualListItem } from './VirtualList';
import { getMessage } from '../../lang';

interface FileGroup {
  name: string;
  description: string;
  files: string[];
}

interface FileGroupVirtualListProps {
  fileGroups: FileGroup[];
  selectedGroup: FileGroup | null;
  onGroupSelect: (group: FileGroup) => void;
  onGroupDelete: (groupName: string) => void;
  height?: number;
  searchValue?: string;
  className?: string;
}

const FileGroupVirtualList: React.FC<FileGroupVirtualListProps> = ({
  fileGroups,
  selectedGroup,
  onGroupSelect,
  onGroupDelete,
  height = 400,
  searchValue = '',
  className = '',
}) => {
  // 将 FileGroup 转换为 VirtualListItem
  const virtualListItems: VirtualListItem[] = useMemo(() => {
    return fileGroups.map((group) => ({
      id: group.name,
      name: group.name,
      description: group.description,
      count: group.files.length,
      icon: <TeamOutlined />,
      data: group,
    }));
  }, [fileGroups]);

  // 处理组选择
  const handleItemClick = useCallback(
    (item: VirtualListItem) => {
      const group = item.data as FileGroup;
      onGroupSelect(group);
    },
    [onGroupSelect]
  );

  // 处理组删除
  const handleItemDelete = useCallback(
    (item: VirtualListItem) => {
      onGroupDelete(item.id);
    },
    [onGroupDelete]
  );

  // 自定义渲染内容
  const renderCustomContent = useCallback((item: VirtualListItem) => {
    const group = item.data as FileGroup;
    if (!group.description) return null;
    
    return (
      <div className="text-xs text-gray-400 mt-1 line-clamp-2">
        {group.description}
      </div>
    );
  }, []);

  return (
    <VirtualList
      items={virtualListItems}
      height={height}
      itemHeight={72} // 稍微高一点以容纳描述文本
      selectedId={selectedGroup?.name}
      onItemClick={handleItemClick}
      onItemDelete={handleItemDelete}
      showDeleteButton={true}
      emptyText={getMessage("fileGroup.noGroups")}
      className={`file-group-virtual-list ${className}`}
      searchValue={searchValue}
      renderCustomContent={renderCustomContent}
      showTooltip={true}
    />
  );
};

export default FileGroupVirtualList;

