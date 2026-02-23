import { useCallback, useRef, useState, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

export function ImageResizeNodeView({ node, updateAttributes, selected }: NodeViewProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [resizing, setResizing] = useState(false);
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const { src, alt, title, width, height } = node.attrs;

  const onMouseDown = useCallback(
    (e: React.MouseEvent, _corner: string) => {
      e.preventDefault();
      e.stopPropagation();

      const img = imgRef.current;
      if (!img) return;

      startPos.current = {
        x: e.clientX,
        y: e.clientY,
        width: img.offsetWidth,
        height: img.offsetHeight,
      };

      setResizing(true);
    },
    []
  );

  useEffect(() => {
    if (!resizing) return;

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startPos.current.x;
      const aspectRatio = startPos.current.width / startPos.current.height;
      const newWidth = Math.max(50, startPos.current.width + dx);
      const newHeight = Math.round(newWidth / aspectRatio);

      updateAttributes({ width: newWidth, height: newHeight });
    };

    const onMouseUp = () => {
      setResizing(false);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [resizing, updateAttributes]);

  return (
    <NodeViewWrapper className="resizable-image-wrapper" data-drag-handle>
      <div className={`resizable-image ${selected ? 'selected' : ''}`} style={{ display: 'inline-block' }}>
        <img
          ref={imgRef}
          src={src}
          alt={alt || ''}
          title={title || ''}
          style={{
            width: width ? `${width}px` : undefined,
            height: height ? `${height}px` : undefined,
          }}
          draggable={false}
        />
        {selected && (
          <>
            <div className="resize-handle se" onMouseDown={(e) => onMouseDown(e, 'se')} />
            <div className="resize-handle sw" onMouseDown={(e) => onMouseDown(e, 'sw')} />
            <div className="resize-handle ne" onMouseDown={(e) => onMouseDown(e, 'ne')} />
            <div className="resize-handle nw" onMouseDown={(e) => onMouseDown(e, 'nw')} />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}
