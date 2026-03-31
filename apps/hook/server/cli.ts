export function isTopLevelHelpInvocation(args: string[]): boolean {
  return args[0] === "--help";
}

export function isInteractiveNoArgInvocation(
  args: string[],
  stdinIsTTY: boolean | undefined,
): boolean {
  return args.length === 0 && stdinIsTTY === true;
}

export function formatTopLevelHelp(): string {
  return [
    "Usage:",
    "  plannotator --help",
    "  plannotator [--browser <name>]",
    "  plannotator review [PR_URL]",
    "  plannotator annotate <file.md | folder/>",
    "  plannotator last",
    "  plannotator archive",
    "  plannotator sessions",
    "",
    "Note:",
    "  running 'plannotator' without arguments is for hook integration and expects JSON on stdin",
  ].join("\n");
}

export function formatInteractiveNoArgClarification(): string {
  return [
    "plannotator (without arguments) is usually launched automatically by Claude Code hooks.",
    "It expects hook JSON on stdin.",
    "",
    "For interactive use, try:",
    "  plannotator review",
    "  plannotator annotate <file.md>",
    "  plannotator last",
    "  plannotator archive",
    "  plannotator sessions",
    "",
    "Run 'plannotator --help' for top-level usage.",
  ].join("\n");
}
