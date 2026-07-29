"use server";

import { getAdminSession } from "@/lib/auth/admin-session";
import { getWorkspace, upsertWorkspace, type WorkspaceInput } from "./workspace.repository";
import { listConversationsForIdentity } from "@/features/ai/conversations/conversations.repository";
import { listMyUploadedFiles } from "@/features/ai/uploads/uploads.repository";
import { apiSuccess, apiError, type ApiResult } from "@/types/api";

/** The "AI Workspace" — scoped to registered users only; see schema-level note on why guests don't get one. */
export async function getMyWorkspaceAction(): Promise<ApiResult<Awaited<ReturnType<typeof getWorkspace>>>> {
  const session = await getAdminSession();
  if (!session) return apiError("You must be signed in to have an AI Workspace.", "UNAUTHENTICATED");

  const workspace = await getWorkspace(session.id);
  return apiSuccess(workspace);
}

export async function updateMyWorkspaceAction(input: WorkspaceInput): Promise<ApiResult<null>> {
  const session = await getAdminSession();
  if (!session) return apiError("You must be signed in to have an AI Workspace.", "UNAUTHENTICATED");

  if (input.budgetMin !== undefined && input.budgetMax !== undefined && input.budgetMin > input.budgetMax) {
    return apiError("Minimum budget cannot be greater than maximum budget.", "VALIDATION");
  }

  await upsertWorkspace(session.id, input);
  return apiSuccess(null);
}

export interface WorkspaceOverview {
  workspace: Awaited<ReturnType<typeof getWorkspace>>;
  recentConversations: Awaited<ReturnType<typeof listConversationsForIdentity>>;
  uploadedFileCount: number;
}

export async function getWorkspaceOverviewAction(): Promise<ApiResult<WorkspaceOverview>> {
  const session = await getAdminSession();
  if (!session) return apiError("You must be signed in to view your AI Workspace.", "UNAUTHENTICATED");

  const [workspace, recentConversations, files] = await Promise.all([
    getWorkspace(session.id),
    listConversationsForIdentity({ userId: session.id }),
    listMyUploadedFiles({ userId: session.id }),
  ]);

  return apiSuccess({ workspace, recentConversations, uploadedFileCount: files.length });
}
