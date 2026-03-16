import { useEffect } from "react";
import { App } from "antd";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import useSWR from "swr";
import classService from "../../../services/classService";

export function useClassList() {
  const { message } = App.useApp();

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(10),
  );
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );
  const [status, setStatus] = useQueryState(
    "status",
    parseAsString.withDefault(""),
  );
  const [branchId, setBranchId] = useQueryState("branchId", parseAsInteger);

  const swrKey = ["classes", page, limit, search, status, branchId];

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    async () => {
      const params = { page, limit };
      if (search) params.search = search;
      if (status) params.status = status;
      if (branchId !== null) params.branchId = branchId;
      const response = await classService.list(params);
      return response?.data ?? { items: [], pagination: { total: 0 } };
    },
    { keepPreviousData: true },
  );

  useEffect(() => {
    if (error) {
      message.error(error?.message || "Không thể tải danh sách lớp học");
    }
  }, [error, message]);

  const items = data?.items ?? [];
  const total = data?.pagination?.total ?? 0;
  const loading = isLoading || isValidating;
  const fetchData = () => mutate();

  const handleDelete = async (id) => {
    try {
      await classService.remove(id);
      message.success("Xóa lớp học thành công");
      const lastPage = Math.max(1, Math.ceil((total - 1) / limit));
      if (page > lastPage) setPage(lastPage);
      else mutate();
    } catch (err) {
      message.error(err?.message || "Xóa lớp học thất bại");
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
    status,
    setStatus,
    branchId,
    setBranchId,
    fetchData,
    handleDelete,
  };
}
