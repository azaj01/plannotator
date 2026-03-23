/**
 * SidebarContainer — Shared sidebar shell
 *
 * Houses the Table of Contents, Version Browser, Vault Browser, and Archive Browser views.
 * Tab bar at top switches between them.
 */

import React from "react";
import type { SidebarTab } from "../../hooks/useSidebar";
import type { Block, Annotation } from "../../types";
import type { VersionInfo, VersionEntry } from "../../hooks/usePlanDiff";
import type { UseVaultBrowserReturn } from "../../hooks/useVaultBrowser";
import { TableOfContents } from "../TableOfContents";
import { VersionBrowser } from "./VersionBrowser";
import { VaultBrowser } from "./VaultBrowser";
import { ArchiveBrowser, type ArchivedPlan } from "./ArchiveBrowser";

interface SidebarContainerProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onClose: () => void;
  width: number;
  // TOC props
  blocks: Block[];
  annotations: Annotation[];
  activeSection: string | null;
  onTocNavigate: (blockId: string) => void;
  linkedDocFilepath?: string | null;
  onLinkedDocBack?: () => void;
  // Vault Browser props
  showVaultTab?: boolean;
  vaultPath?: string;
  vaultBrowser?: UseVaultBrowserReturn;
  onVaultSelectFile?: (relativePath: string) => void;
  onVaultFetchTree?: () => void;
  // Version Browser props
  versionInfo: VersionInfo | null;
  versions: VersionEntry[];
  selectedBaseVersion: number | null;
  onSelectBaseVersion: (version: number) => void;
  isPlanDiffActive: boolean;
  hasPreviousVersion: boolean;
  onActivatePlanDiff: () => void;
  isLoadingVersions: boolean;
  isSelectingVersion: boolean;
  fetchingVersion: number | null;
  onFetchVersions: () => void;
  // Archive Browser props
  showArchiveTab?: boolean;
  archivePlans: ArchivedPlan[];
  selectedArchiveFile: string | null;
  onArchiveSelect: (filename: string) => void;
  isLoadingArchive: boolean;
}

export const SidebarContainer: React.FC<SidebarContainerProps> = ({
  activeTab,
  onTabChange,
  onClose,
  width,
  blocks,
  annotations,
  activeSection,
  onTocNavigate,
  linkedDocFilepath,
  onLinkedDocBack,
  showVaultTab,
  vaultPath,
  vaultBrowser,
  onVaultSelectFile,
  onVaultFetchTree,
  versionInfo,
  versions,
  selectedBaseVersion,
  onSelectBaseVersion,
  isPlanDiffActive,
  hasPreviousVersion,
  onActivatePlanDiff,
  isLoadingVersions,
  isSelectingVersion,
  fetchingVersion,
  onFetchVersions,
  showArchiveTab,
  archivePlans,
  selectedArchiveFile,
  onArchiveSelect,
  isLoadingArchive,
}) => {
  return (
    <aside
      className="hidden lg:flex flex-col sticky top-12 h-[calc(100vh-3rem)] flex-shrink-0 bg-card/50 backdrop-blur-sm border-r border-border"
      style={{ width }}
    >
      {/* Tab bar */}
      <div className="flex items-center border-b border-border/50 px-1 py-1 gap-0.5 flex-shrink-0 overflow-hidden min-w-0">
        <TabButton
          active={activeTab === "toc"}
          onClick={() => onTabChange("toc")}
          icon={
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 10h16M4 14h10M4 18h10"
              />
            </svg>
          }
          label="Contents"
        />
        <TabButton
          active={activeTab === "versions"}
          onClick={() => onTabChange("versions")}
          icon={
            <svg
              className="w-3 h-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          label="Versions"
        />
        {showVaultTab && (
          <TabButton
            active={activeTab === "vault"}
            onClick={() => onTabChange("vault")}
            icon={
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            }
            label="Vault"
          />
        )}
        {showArchiveTab && (
          <TabButton
            active={activeTab === "archive"}
            onClick={() => onTabChange("archive")}
            icon={
              <svg
                className="w-3 h-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
            }
            label="Archive"
          />
        )}
        <div className="flex-1 min-w-0" />
        <button
          onClick={onClose}
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          title="Close sidebar"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "toc" && (
          <TableOfContents
            blocks={blocks}
            annotations={annotations}
            activeId={activeSection}
            onNavigate={onTocNavigate}
            className="overflow-y-auto"
            linkedDocFilepath={linkedDocFilepath}
            onLinkedDocBack={onLinkedDocBack}
          />
        )}
        {activeTab === "versions" && (
          <VersionBrowser
            versionInfo={versionInfo}
            versions={versions}
            selectedBaseVersion={selectedBaseVersion}
            onSelectBaseVersion={onSelectBaseVersion}
            isPlanDiffActive={isPlanDiffActive}
            hasPreviousVersion={hasPreviousVersion}
            onActivatePlanDiff={onActivatePlanDiff}
            isLoading={isLoadingVersions}
            isSelectingVersion={isSelectingVersion}
            fetchingVersion={fetchingVersion}
            onFetchVersions={onFetchVersions}
          />
        )}
        {activeTab === "vault" && showVaultTab && vaultPath && vaultBrowser && (
          <VaultBrowser
            vaultPath={vaultPath}
            tree={vaultBrowser.tree}
            isLoading={vaultBrowser.isLoading}
            error={vaultBrowser.error}
            expandedFolders={vaultBrowser.expandedFolders}
            onToggleFolder={vaultBrowser.toggleFolder}
            onSelectFile={onVaultSelectFile ?? (() => {})}
            activeFile={vaultBrowser.activeFile}
            onFetchTree={onVaultFetchTree ?? (() => {})}
          />
        )}
        {activeTab === "archive" && showArchiveTab && (
          <ArchiveBrowser
            plans={archivePlans}
            selectedFile={selectedArchiveFile}
            onSelect={onArchiveSelect}
            isLoading={isLoadingArchive}
          />
        )}
      </div>
    </aside>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors min-w-0 shrink-0 ${
      active
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    }`}
  >
    {icon}
    {label}
  </button>
);
