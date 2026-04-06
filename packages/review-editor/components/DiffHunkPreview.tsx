import React, { useMemo, useState, useEffect } from 'react';
import { FileDiff } from '@pierre/diffs/react';
import { getSingularPatch } from '@pierre/diffs';
import { useTheme } from '@plannotator/ui/components/ThemeProvider';
import { useReviewState } from '../dock/ReviewStateContext';

interface DiffHunkPreviewProps {
  /** Raw diff hunk string (unified diff format). */
  hunk: string;
  /** Max height in pixels before "Show more" toggle. Default 128. */
  maxHeight?: number;
  className?: string;
}

/**
 * Renders a small inline diff hunk using @pierre/diffs.
 * Compact, read-only, no file header. Shares theme + font settings
 * with the main DiffViewer via the same unsafeCSS injection pattern.
 */
export const DiffHunkPreview: React.FC<DiffHunkPreviewProps> = ({
  hunk,
  maxHeight = 128,
  className,
}) => {
  const { resolvedMode } = useTheme();
  const state = useReviewState();
  const [expanded, setExpanded] = useState(false);

  const fileDiff = useMemo(() => {
    if (!hunk) return undefined;
    try {
      const needsHeaders = !hunk.startsWith('diff --git') && !hunk.startsWith('--- ');
      const patch = needsHeaders
        ? `diff --git a/file b/file\n--- a/file\n+++ b/file\n${hunk}`
        : hunk;
      return getSingularPatch(patch);
    } catch {
      return undefined;
    }
  }, [hunk]);

  // Theme injection — same pattern as DiffViewer (reads computed CSS vars, injects via unsafeCSS)
  const [pierreTheme, setPierreTheme] = useState<{ type: 'dark' | 'light'; css: string }>({
    type: resolvedMode,
    css: '',
  });

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      const styles = getComputedStyle(document.documentElement);
      const bg = styles.getPropertyValue('--background').trim();
      const fg = styles.getPropertyValue('--foreground').trim();
      if (!bg || !fg) return;

      const fontFamily = state.fontFamily;
      const fontSize = state.fontSize;
      const fontCSS = fontFamily || fontSize ? `
        pre, code, [data-line-content], [data-column-number] {
          ${fontFamily ? `font-family: '${fontFamily}', monospace !important;` : ''}
          ${fontSize ? `font-size: ${fontSize} !important; line-height: 1.5 !important;` : ''}
        }` : '';

      setPierreTheme({
        type: resolvedMode,
        css: `
          :host, [data-diff], [data-file], [data-diffs-header], [data-error-wrapper], [data-virtualizer-buffer] {
            --diffs-bg: ${bg} !important;
            --diffs-fg: ${fg} !important;
            --diffs-dark-bg: ${bg};
            --diffs-light-bg: ${bg};
            --diffs-dark: ${fg};
            --diffs-light: ${fg};
          }
          pre, code { background-color: ${bg} !important; }
          [data-column-number] { background-color: ${bg} !important; }
          [data-file-info] { display: none !important; }
          [data-diffs-header] { display: none !important; }
          ${fontCSS}
        `,
      });
    });
    return () => cancelAnimationFrame(rafId);
  }, [resolvedMode, state.fontFamily, state.fontSize]);

  if (!fileDiff) return null;

  return (
    <div className={`rounded overflow-hidden border border-border/20 ${className ?? ''}`}>
      <div
        className="overflow-hidden"
        style={expanded ? undefined : { maxHeight }}
      >
        <FileDiff
          fileDiff={fileDiff}
          options={{
            themeType: pierreTheme.type,
            unsafeCSS: pierreTheme.css,
            diffStyle: 'unified',
            disableLineNumbers: true,
            disableFileHeader: true,
            disableBackground: true,
            overflow: 'wrap',
          }}
        />
      </div>
      {!expanded && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
          className="w-full text-[10px] text-muted-foreground hover:text-foreground py-1 bg-muted/20 border-t border-border/20 transition-colors"
        >
          Show full context
        </button>
      )}
    </div>
  );
};
