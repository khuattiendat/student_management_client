import { useEffect } from "react";
import { App } from "antd";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import useSWR, { useSWRConfig } from "swr";
import branchService from "../../../services/branchService";

export function useBranchList() {
  const { message } = App.useApp();
  const { mutate: globalMutate } = useSWRConfig();

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10),
  );
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  const swrKey = ["branches", page, limit, search];

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: mutateList,
  } = useSWR(
    swrKey,
    async () => {
      const params = { page, limit };
      if (search) params.search = search;
      const response = await branchService.list(params);
      return response?.data ?? { items: [], pagination: { total: 0 } };
    },
    {
      keepPreviousData: true,
    },
  );

  useEffect(() => {
    if (error) {
      message.error(error?.message || "Không thể tải danh sách cơ sở");
    }
  }, [error, message]);

  const items = data?.items ?? [];
  const total = data?.pagination?.total ?? 0;
  const loading = isLoading || isValidating;
  const syncSidebarData = () => globalMutate("admin-layout-data");

  const fetchData = async () => {
    await mutateList();
    await syncSidebarData();
  };

  const handleDelete = async (id) => {
    try {
      await branchService.remove(id);
      message.success("Xóa cơ sở thành công");
      const lastPage = Math.max(1, Math.ceil((total - 1) / limit));
      if (page > lastPage) setPage(lastPage);
      else await mutateList();
      await syncSidebarData();
    } catch (err) {
      message.error(err?.message || "Xóa thất bại");
    }
  };

  return {
    items,
    total,
    loading,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    fetchData,
    handleDelete,
  };
}
