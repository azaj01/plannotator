import React from 'react';
import type { ResizeHandleProps as BaseProps } from '../hooks/useResizablePanel';

interface Props extends BaseProps {
  className?: string;
  /** When set, touch area extends rightward only to avoid covering adjacent scrollbars.
   *  Both 'left' and 'right' produce the same behavior — scrollbars sit on the right
   *  edge of left-adjacent panels, so the handle must never extend leftward. */
  side?: 'left' | 'right';
}

export const ResizeHandle: React.FC<Props> = ({
  isDragging,
  onMouseDown,
  onTouchStart,
  onDoubleClick,
  className,
  side,
}) => (
  <div
    className={`relative w-0 cursor-col-resize flex-shrink-0 group z-10${className ? ` ${className}` : ''}`}
  >
    {/* Visible track — 4px wide, centered on the zero-width layout box */}
    <div className={`absolute inset-y-0 -left-0.5 -right-0.5 transition-colors ${
      isDragging ? 'bg-primary/50' : 'group-hover:bg-border'
    }`} />
    {/* Wider touch area — extends rightward to avoid covering left-side scrollbars */}
    <div
      className={`absolute inset-y-0 ${
        side ? 'left-0 -right-3' : '-inset-x-2'
      }`}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onDoubleClick={onDoubleClick}
    />
  </div>
);
