import React, { useMemo, useCallback, useRef, useEffect } from "react";
import { FixedSizeList as List } from "react-window";
import { Button, Empty, Tooltip } from "antd";
import {
  DeleteOutlined,
  FolderOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import "./VirtualList.css";

export interface VirtualListItem {
  id: string;
  name: string;
  description?: string;
  count?: number;
  icon?: React.ReactNode;
  selected?: boolean;
  data?: any;
}

export interface VirtualListProps {
  items: VirtualListItem[];
  height?: number;
  itemHeight?: number;
  selectedId?: string;
  onItemClick?: (item: VirtualListItem) => void;
  onItemDelete?: (item: VirtualListItem) => void;
  showDeleteButton?: boolean;
  emptyText?: string;
  className?: string;
  searchValue?: string;
  renderCustomContent?: (item: VirtualListItem) => React.ReactNode;
  showTooltip?: boolean;
}

interface ItemRendererProps {
  index: number;
  style: React.CSSProperties;
  data: {
    items: VirtualListItem[];
    selectedId?: string;
    onItemClick?: (item: VirtualListItem) => void;
    onItemDelete?: (item: VirtualListItem) => void;
    showDeleteButton?: boolean;
    renderCustomContent?: (item: VirtualListItem) => React.ReactNode;
    showTooltip?: boolean;
  };
}

const ItemRenderer: React.FC<ItemRendererProps> = ({ index, style, data }) => {
  const {
    items,
    selectedId,
    onItemClick,
    onItemDelete,
    showDeleteButton,
    renderCustomContent,
    showTooltip,
  } = data;

  const item = items[index];
  const isSelected = selectedId === item.id;

  const handleClick = useCallback(() => {
    onItemClick?.(item);
  }, [item, onItemClick]);

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onItemDelete?.(item);
    },
    [item, onItemDelete]
  );

  const content = (
    <div
      style={style}
      className={`virtual-list-item ${isSelected ? "selected" : ""}`}
      onClick={handleClick}
    >
      <div className="virtual-list-item-content">
        <div className="virtual-list-item-main">
          <div className="virtual-list-item-icon">
            {item.icon || <FolderOutlined />}
          </div>
          <div className="virtual-list-item-text">
            <div className="virtual-list-item-name" title={item.name}>
              {item.name}
            </div>
            {item.description && (
              <div
                className="virtual-list-item-description truncate"
                title={item.description}
              >
                {item.description}
              </div>
            )}
          </div>
        </div>

        <div className="virtual-list-item-actions">
          {typeof item.count === "number" && (
            <span className="virtual-list-item-count">{item.count}</span>
          )}
          {showDeleteButton && (
            <Button
              type="text"
              danger
              size="small"
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              className="virtual-list-delete-btn"
            />
          )}
        </div>
      </div>

      {/* {renderCustomContent && (
        <div className="virtual-list-item-custom">
          {renderCustomContent(item)}
        </div>
      )} */}
    </div>
  );

  if (showTooltip && item.description) {
    return (
      <Tooltip title={item.description} placement="right">
        {content}
      </Tooltip>
    );
  }

  return content;
};

const VirtualList: React.FC<VirtualListProps> = ({
  items,
  height = 400,
  itemHeight = 60,
  selectedId,
  onItemClick,
  onItemDelete,
  showDeleteButton = true,
  emptyText = "暂无数据",
  className = "",
  searchValue = "",
  renderCustomContent,
  showTooltip = false,
}) => {
  const listRef = useRef<List>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = React.useState(height);

  // 动态计算容器高度
  React.useEffect(() => {
    if (height === 0 && containerRef.current) {
      const updateHeight = () => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          setContainerHeight(rect.height);
        }
      };

      updateHeight();

      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    } else {
      setContainerHeight(height);
    }
  }, [height]);

  // 过滤搜索结果
  const filteredItems = useMemo(() => {
    if (!searchValue.trim()) return items;

    const searchLower = searchValue.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchLower) ||
        (item.description &&
          item.description.toLowerCase().includes(searchLower))
    );
  }, [items, searchValue]);

  // 滚动到选中项
  useEffect(() => {
    if (selectedId && listRef.current) {
      const selectedIndex = filteredItems.findIndex(
        (item) => item.id === selectedId
      );
      if (selectedIndex >= 0) {
        listRef.current.scrollToItem(selectedIndex, "center");
      }
    }
  }, [selectedId, filteredItems]);

  const itemData = useMemo(
    () => ({
      items: filteredItems,
      selectedId,
      onItemClick,
      onItemDelete,
      showDeleteButton,
      renderCustomContent,
      showTooltip,
    }),
    [
      filteredItems,
      selectedId,
      onItemClick,
      onItemDelete,
      showDeleteButton,
      renderCustomContent,
      showTooltip,
    ]
  );

  if (filteredItems.length === 0) {
    return (
      <div
        ref={containerRef}
        className={`virtual-list-container empty ${className}`}
        style={{ height: height === 0 ? "100%" : height }}
      >
        <div className="virtual-list-empty">
          <Empty
            description={<span className="text-gray-400">{emptyText}</span>}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`virtual-list-container ${className}`}
      style={{ height: height === 0 ? "100%" : height }}
    >
      <List
        ref={listRef}
        height={containerHeight}
        width="100%"
        itemCount={filteredItems.length}
        itemSize={itemHeight}
        itemData={itemData}
        overscanCount={5}
        className="virtual-list"
      >
        {ItemRenderer}
      </List>
    </div>
  );
};

export default VirtualList;
