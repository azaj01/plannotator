import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { AgentJobInfo, AgentCapabilities } from '../types';
import { isTerminalStatus } from '@plannotator/shared/agent-jobs';
import { ReviewAgentsIcon } from './ReviewAgentsIcon';

interface AgentsTabProps {
  jobs: AgentJobInfo[];
  capabilities: AgentCapabilities | null;
  onLaunch: (params: { provider?: string; command?: string[]; label?: string }) => void;
  onKillJob: (id: string) => void;
  onKillAll: () => void;
  externalAnnotations: Array<{ source?: string }>;
  onOpenJobDetail?: (jobId: string) => void;
}

// --- Duration display ---

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function ElapsedTime({ startedAt }: { startedAt: number }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return <>{formatDuration(Date.now() - startedAt)}</>;
}

// --- Status badge ---

function StatusBadge({ status }: { status: AgentJobInfo['status'] }) {
  switch (status) {
    case 'starting':
    case 'running':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-primary">
          <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {status === 'starting' ? 'Starting' : 'Running'}
        </span>
      );
    case 'done':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-success">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Done
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-destructive">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Failed
        </span>
      );
    case 'killed':
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 110 2h-4a1 1 0 01-1-1z" />
          </svg>
          Killed
        </span>
      );
  }
}

// --- Provider badge ---

function ProviderBadge({ provider }: { provider: string }) {
  const label =
    provider === 'claude' ? 'Claude' :
    provider === 'codex' ? 'Codex' :
    'Shell';
  return (
    <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
      {label}
    </span>
  );
}

// --- Job card ---

function JobCard({
  job,
  annotationCount,
  onKill,
  expanded,
  onToggle,
  onViewDetails,
}: {
  job: AgentJobInfo;
  annotationCount: number;
  onKill: () => void;
  expanded: boolean;
  onToggle: () => void;
  onViewDetails?: () => void;
}) {
  const isTerminal = isTerminalStatus(job.status);

  return (
    <div
      className={`group relative p-2.5 rounded border transition-all cursor-pointer ${
        expanded
          ? 'bg-muted/30 border-border/50'
          : 'border-transparent hover:bg-muted/30 hover:border-border/50'
      }`}
      onClick={onViewDetails ? () => onViewDetails() : (isTerminal ? onToggle : undefined)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <ProviderBadge provider={job.provider} />
          <span className="text-xs text-foreground/80 truncate">{job.label}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {annotationCount > 0 && (
            <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
              {annotationCount}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground/60 font-mono">
            {isTerminal && job.endedAt
              ? formatDuration(job.endedAt - job.startedAt)
              : <ElapsedTime startedAt={job.startedAt} />
            }
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-1.5">
        <StatusBadge status={job.status} />
        <div className="flex items-center gap-1">
          {!isTerminal && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onKill();
              }}
              className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
              title="Kill agent"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Error details — fallback for when dockview detail panel is not available */}
      {!onViewDetails && job.status === 'failed' && job.error && expanded && (
        <div className="mt-2 p-2 rounded bg-destructive/5 border border-destructive/20">
          <pre className="text-[10px] text-destructive/80 whitespace-pre-wrap break-all font-mono leading-relaxed max-h-24 overflow-y-auto">
            {job.error}
          </pre>
        </div>
      )}
    </div>
  );
}

// --- Main component ---

export const AgentsTab: React.FC<AgentsTabProps> = ({
  jobs,
  capabilities,
  onLaunch,
  onKillJob,
  onKillAll,
  externalAnnotations,
  onOpenJobDetail,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const initializedRef = useRef(false);

  // Set default provider once capabilities load
  useEffect(() => {
    if (capabilities && !initializedRef.current) {
      const firstAvailable = capabilities.providers.find((p) => p.available);
      if (firstAvailable) {
        setSelectedProvider(firstAvailable.id);
        initializedRef.current = true;
      }
    }
  }, [capabilities]);

  const availableProviders = useMemo(
    () => capabilities?.providers.filter((p) => p.available) ?? [],
    [capabilities],
  );

  // Annotation counts per job source
  const annotationCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const ann of externalAnnotations) {
      if (ann.source) {
        counts.set(ann.source, (counts.get(ann.source) ?? 0) + 1);
      }
    }
    return counts;
  }, [externalAnnotations]);

  // Sort: running first, then by startedAt descending
  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      const aRunning = !isTerminalStatus(a.status);
      const bRunning = !isTerminalStatus(b.status);
      if (aRunning !== bRunning) return aRunning ? -1 : 1;
      return b.startedAt - a.startedAt;
    });
  }, [jobs]);

  const runningCount = useMemo(
    () => jobs.filter((j) => !isTerminalStatus(j.status)).length,
    [jobs],
  );

  const handleLaunch = () => {
    if (!selectedProvider) return;
    const provider = availableProviders.find((p) => p.id === selectedProvider);
    onLaunch({
      provider: selectedProvider,
      label: provider ? `${provider.name} Review` : selectedProvider,
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Launch bar */}
      {availableProviders.length > 0 && (
        <div className="p-2 border-b border-border/30">
          <div className="flex items-center gap-1.5">
            {availableProviders.length > 1 ? (
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="flex-1 text-xs px-2 py-1.5 rounded bg-muted/50 border border-border/50 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                {availableProviders.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="flex-1 text-xs px-2 py-1.5 text-muted-foreground">
                {availableProviders[0]?.name}
              </span>
            )}
            <button
              onClick={handleLaunch}
              disabled={!selectedProvider}
              className="px-3 py-1.5 rounded text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Run Agent
            </button>
          </div>
        </div>
      )}

      {/* Job list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {sortedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <ReviewAgentsIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              No agent jobs yet
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              Launch an agent to get automated review findings
            </p>
          </div>
        ) : (
          sortedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              annotationCount={annotationCounts.get(job.source) ?? 0}
              onKill={() => onKillJob(job.id)}
              expanded={expandedJobId === job.id}
              onToggle={() => setExpandedJobId(expandedJobId === job.id ? null : job.id)}
              onViewDetails={onOpenJobDetail ? () => onOpenJobDetail(job.id) : undefined}
            />
          ))
        )}
      </div>

      {/* Kill All footer */}
      {runningCount >= 2 && (
        <div className="p-2 border-t border-border/50">
          <button
            onClick={onKillAll}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-medium text-destructive hover:bg-destructive/10 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Kill All ({runningCount})
          </button>
        </div>
      )}
    </div>
  );
};
