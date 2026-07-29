import type { Metadata } from "next";
import { requireAdminSession } from "@/lib/auth/admin-session";
import { getWorkspaceOverviewAction } from "@/features/ai/workspace/workspace.actions";
import { WorkspacePanel } from "@/components/ai/workspace-panel";

export const metadata: Metadata = {
  title: "AI Workspace",
  description: "Your personal NEXFORM AI workspace — preferences, ideas, and conversation history.",
};

export default async function AiWorkspacePage() {
  await requireAdminSession();
  const result = await getWorkspaceOverviewAction();

  if (!result.success) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-sm text-muted-foreground">{result.error}</div>
    );
  }

  return <WorkspacePanel overview={result.data} />;
}
