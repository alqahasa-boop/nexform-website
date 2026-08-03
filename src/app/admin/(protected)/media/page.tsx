import type { Metadata } from "next";
import { requirePermission } from "@/lib/auth/admin-session";
import { listMediaAssets, listFoldersWithAssetCounts, countRootMediaAssets } from "@/features/media/media.repository";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminSearchInput } from "@/components/admin/search-input";
import { AdminSelectFilter } from "@/components/admin/select-filter";
import { AdminPagination } from "@/components/admin/pagination";
import { EmptyState } from "@/components/admin/empty-state";
import { ImageIcon } from "lucide-react";
import { MediaUploadButton } from "./media-upload-button";
import { MediaGridItem } from "./media-grid-item";
import { MediaFolderSidebar } from "./media-folder-sidebar";
import { hasPermission } from "@/types/rbac";

export const metadata: Metadata = { title: "Media Library" };
export const dynamic = "force-dynamic";

export default async function MediaLibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; kind?: string; search?: string; folderId?: string }>;
}) {
  const user = await requirePermission("media:view");
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const activeFolderId = params.folderId ?? null;

  const [result, folders, rootCount] = await Promise.all([
    listMediaAssets({
      page,
      pageSize: 24,
      kind: params.kind as never,
      search: params.search,
      folderId: activeFolderId ?? undefined,
    }),
    listFoldersWithAssetCounts(),
    countRootMediaAssets(),
  ]);
  const canDelete = hasPermission(user, "media:delete");
  const folderOptions = folders.map((f) => ({ id: f.id, name: f.name }));

  return (
    <div>
      <AdminPageHeader
        title="Media Library"
        description="Images, PDFs, and documents used across the site."
        actions={<MediaUploadButton folderId={activeFolderId} />}
      />

      <div className="flex flex-col gap-6 sm:flex-row">
        <MediaFolderSidebar
          folders={folders.map((f) => ({ id: f.id, name: f.name, assetCount: f._count.assets }))}
          rootCount={rootCount}
          activeFolderId={activeFolderId}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <AdminSearchInput placeholder="Search by file name…" />
            <AdminSelectFilter
              paramKey="kind"
              placeholder="Type"
              options={[
                { value: "IMAGE", label: "Images" },
                { value: "PDF", label: "PDFs" },
                { value: "DOCUMENT", label: "Documents" },
                { value: "VIDEO", label: "Videos" },
              ]}
            />
          </div>

          {result.items.length === 0 ? (
            <EmptyState icon={ImageIcon} title="No files yet" description="Upload your first file to get started." />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {result.items.map((item) => (
                <MediaGridItem
                  key={item.id}
                  canDelete={canDelete}
                  folders={folderOptions}
                  item={{
                    id: item.id,
                    url: item.url,
                    fileName: item.fileName,
                    kind: item.kind,
                    sizeBytes: item.sizeBytes,
                    uploadedBy: null,
                    folderId: item.folderId,
                  }}
                />
              ))}
            </div>
          )}
          <AdminPagination page={result.page} pageSize={result.pageSize} total={result.total} totalPages={result.totalPages} />
        </div>
      </div>
    </div>
  );
}
