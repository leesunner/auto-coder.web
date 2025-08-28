import React, {
  useState,
  useRef,
  useEffect,
  cloneElement,
  type ReactNode,
} from "react";

export interface DropdownMenuItem {
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

export interface DropdownMenuProps {
  items: DropdownMenuItem[];
}

export interface DropdownProps {
  children: Parameters<typeof cloneElement>[0];
  menu: DropdownMenuProps;
  trigger?: ("click" | "hover")[];
  placement?:
    | "bottom"
    | "bottomLeft"
    | "bottomRight"
    | "top"
    | "topLeft"
    | "topRight"
    | "left"
    | "right";
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  selectClass?: string;
  defaultActiveKey?: string;
  size?: "small" | "middle" | "large" | undefined;
}

const Dropdown: React.FC<DropdownProps> = ({
  children,
  menu,
  trigger = ["hover"],
  placement = "bottomLeft",
  disabled = false,
  onOpenChange,
  open: controlledOpen,
  selectClass = "w-56",
  defaultActiveKey = "",
  size = "middle",
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [active, setActive] = useState(defaultActiveKey);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 使用受控状态或内部状态
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (disabled) return;

    if (controlledOpen === undefined) {
      setInternalOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };
  // 点击触发逻辑
  const handleClick = (e: React.MouseEvent) => {
    if (trigger.includes("click")) {
      handleOpenChange(!isOpen);
      children.props?.onClick?.(e);
    }
  };

  // 悬停触发逻辑
  const handleMouseEnter = () => {
    if (trigger.includes("hover")) {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        setHoverTimeout(null);
      }
      handleOpenChange(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger.includes("hover")) {
      const timeout = setTimeout(() => {
        handleOpenChange(false);
      }, 100); // 100ms 延迟，避免鼠标快速移动时闪烁
      setHoverTimeout(timeout);
    }
  };

  // 菜单项点击处理
  const handleMenuItemClick = (item: DropdownMenuItem) => {
    if (item.disabled) return;
    setActive(item.key);
    item.onClick?.();
    // 点击菜单项后关闭下拉菜单
    handleOpenChange(false);
  };

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        handleOpenChange(false);
      }
    };

    if (isOpen && trigger.includes("click")) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, trigger]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  // 获取下拉菜单位置样式
  const getMenuPositionStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      zIndex: 9999,
    };

    switch (placement) {
      case "bottom":
        return {
          ...baseStyle,
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginTop: "4px",
        };
      case "bottomLeft":
        return { ...baseStyle, top: "100%", right: 0, marginTop: "4px" };
      case "bottomRight":
        return { ...baseStyle, top: "100%", left: 0, marginTop: "4px" };
      case "top":
        return {
          ...baseStyle,
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          marginBottom: "4px",
        };
      case "topLeft":
        return { ...baseStyle, bottom: "100%", right: 0, marginBottom: "4px" };
      case "topRight":
        return {
          ...baseStyle,
          bottom: "100%",
          left: 0,
          marginBottom: "4px",
        };
      case "left":
        return {
          ...baseStyle,
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          marginRight: "4px",
        };
      case "right":
        return {
          ...baseStyle,
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          marginLeft: "4px",
        };
      default:
        return { ...baseStyle, top: "100%", left: "0", marginTop: "4px" };
    }
  };

  if (!children) return null;

  const _children = cloneElement(children, {
    ...children?.props,
    onClick: handleClick,
  });
  return (
    <div
      className="relative inline-block"
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {_children}
      {/* 下拉菜单 */}
      {isOpen && (
        <div
          ref={menuRef}
          className={`rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${selectClass}`}
          style={getMenuPositionStyle()}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="py-1">
            {menu.items.map((item) => (
              <button
                key={item.key}
                className={`w-full ${
                  size === "small" ? "" : "px-4 py-2"
                } text-sm flex items-center space-x-2 text-left transition-colors duration-200 ${
                  active === item.key ? "bg-blue-600 text-white" : ""
                } ${
                  item.disabled
                    ? "cursor-not-allowed text-gray-500 bg-gray-800/60"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white cursor-pointer"
                }`}
                onClick={() => handleMenuItemClick(item)}
                disabled={item.disabled}
              >
                {item.icon && (
                  <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>
                )}
                <span className="flex-1">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
