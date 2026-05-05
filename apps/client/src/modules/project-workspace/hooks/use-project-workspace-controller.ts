import { useMemo, useState } from "react";
import { useRequest } from "ahooks";
import { useStoreAuth } from "@/shared/hooks";
import {
  fetchMyPageData,
  fetchPublishedPreview,
  fetchVersionPreview,
  getLocalDraftMeta,
} from "../api";
import type { PageVersionItem, PreviewState } from "../types/project-workspace";

export function useProjectWorkspaceController() {
  const { isLogin, store: storeAuth } = useStoreAuth();
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);
  const isLoggedIn = Boolean(storeAuth.token);

  const { data: myPageData, loading: myPageLoading } = useRequest(
    fetchMyPageData,
    {
      ready: isLoggedIn,
      refreshDeps: [isLoggedIn, storeAuth.details?.id],
    },
  );

  const { runAsync: openPreview, loading: previewLoading } = useRequest(
    async (task: () => Promise<PreviewState>) => {
      const nextState = await task();
      setPreviewState(nextState);
    },
    {
      manual: true,
    },
  );

  const localDraftMeta = useMemo(
    () => getLocalDraftMeta(isLoggedIn, Boolean(myPageData?.page)),
    [isLoggedIn, myPageData?.page],
  );

  const handleOpenPublishedPage = async (
    pageId: number,
    title: string,
    subtitle: string,
  ) => {
    await openPreview(() => fetchPublishedPreview(pageId, title, subtitle));
  };

  const handleOpenVersion = async (version: PageVersionItem) => {
    await openPreview(() => fetchVersionPreview(version));
  };

  return {
    handleOpenPublishedPage,
    handleOpenVersion,
    isLoggedIn: isLogin.get(),
    localDraftMeta,
    myPageData,
    myPageLoading,
    previewLoading,
    previewState,
    setPreviewState,
  };
}
