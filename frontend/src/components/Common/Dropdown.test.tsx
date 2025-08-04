

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dropdown from './Dropdown';
import type { DropdownMenuItem } from './Dropdown';

// Mock items for testing
const mockMenuItems: DropdownMenuItem[] = [
  {
    key: 'item1',
    label: '选项1',
    onClick: jest.fn()
  },
  {
    key: 'item2', 
    label: '选项2',
    disabled: true,
    onClick: jest.fn()
  },
  {
    key: 'item3',
    label: '选项3',
    icon: <span data-testid="icon">🔧</span>,
    onClick: jest.fn()
  }
];

describe('Dropdown Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders trigger element correctly', () => {
    render(
      <Dropdown trigger={['click']} menu={{ items: mockMenuItems }}>
        <button data-testid="trigger">点击我</button>
      </Dropdown>
    );

    expect(screen.getByTestId('trigger')).toBeInTheDocument();
  });

  test('shows menu on click trigger', async () => {
    render(
      <Dropdown trigger={['click']} menu={{ items: mockMenuItems }}>
        <button data-testid="trigger">点击我</button>
      </Dropdown>
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('选项1')).toBeInTheDocument();
      expect(screen.getByText('选项2')).toBeInTheDocument();
      expect(screen.getByText('选项3')).toBeInTheDocument();
    });
  });

  test('calls onClick when menu item is clicked', async () => {
    render(
      <Dropdown trigger={['click']} menu={{ items: mockMenuItems }}>
        <button data-testid="trigger">点击我</button>
      </Dropdown>
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.click(trigger);

    await waitFor(() => {
      const menuItem = screen.getByText('选项1');
      fireEvent.click(menuItem);
    });

    expect(mockMenuItems[0].onClick).toHaveBeenCalledTimes(1);
  });

  test('does not call onClick for disabled menu item', async () => {
    render(
      <Dropdown trigger={['click']} menu={{ items: mockMenuItems }}>
        <button data-testid="trigger">点击我</button>
      </Dropdown>
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.click(trigger);

    await waitFor(() => {
      const disabledItem = screen.getByText('选项2');
      fireEvent.click(disabledItem);
    });

    expect(mockMenuItems[1].onClick).not.toHaveBeenCalled();
  });

  test('displays icons correctly', async () => {
    render(
      <Dropdown trigger={['click']} menu={{ items: mockMenuItems }}>
        <button data-testid="trigger">点击我</button>
      </Dropdown>
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByTestId('icon')).toBeInTheDocument();
    });
  });

  test('closes menu when clicking outside', async () => {
    render(
      <div>
        <Dropdown trigger={['click']} menu={{ items: mockMenuItems }}>
          <button data-testid="trigger">点击我</button>
        </Dropdown>
        <div data-testid="outside">外部区域</div>
      </div>
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('选项1')).toBeInTheDocument();
    });

    const outside = screen.getByTestId('outside');
    fireEvent.mouseDown(outside);

    await waitFor(() => {
      expect(screen.queryByText('选项1')).not.toBeInTheDocument();
    });
  });

  test('works in controlled mode', async () => {
    const onOpenChange = jest.fn();
    
    const ControlledDropdown = () => {
      const [open, setOpen] = React.useState(false);
      
      return (
        <Dropdown 
          trigger={['click']} 
          menu={{ items: mockMenuItems }}
          open={open}
          onOpenChange={(newOpen) => {
            setOpen(newOpen);
            onOpenChange(newOpen);
          }}
        >
          <button data-testid="trigger">点击我</button>
        </Dropdown>
      );
    };

    render(<ControlledDropdown />);

    const trigger = screen.getByTestId('trigger');
    fireEvent.click(trigger);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  test('respects disabled prop', () => {
    render(
      <Dropdown trigger={['click']} menu={{ items: mockMenuItems }} disabled>
        <button data-testid="trigger">点击我</button>
      </Dropdown>
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.click(trigger);

    // Menu should not appear when disabled
    expect(screen.queryByText('选项1')).not.toBeInTheDocument();
  });

  test('shows menu on hover trigger', async () => {
    render(
      <Dropdown trigger={['hover']} menu={{ items: mockMenuItems }}>
        <button data-testid="trigger">悬停我</button>
      </Dropdown>
    );

    const trigger = screen.getByTestId('trigger');
    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(screen.getByText('选项1')).toBeInTheDocument();
    });
  });
});


