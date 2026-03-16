import { useEffect } from "react";
import { App } from "antd";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import useSWR from "swr";
import packageService from "../../../services/packageService";

export function usePackageList() {
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
  const [type, setType] = useQueryState("type", parseAsString.withDefault(""));

  const swrKey = ["packages", page, limit, search, type];

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    async () => {
      const params = { page, limit };
      if (search) params.search = search;
      if (type) params.type = type;
      const response = await packageService.list(params);
      return response?.data ?? { items: [], pagination: { total: 0 } };
    },
    { keepPreviousData: true },
  );

  useEffect(() => {
    if (error) {
      message.error(error?.message || "Không thể tải danh sách gói học");
    }
  }, [error, message]);

  const items = data?.items ?? [];
  const total = data?.pagination?.total ?? 0;
  const loading = isLoading || isValidating;
  const fetchData = () => mutate();

  const handleDelete = async (id) => {
    try {
      await packageService.remove(id);
      message.success("Xóa gói học thành công");
      const lastPage = Math.max(1, Math.ceil((total - 1) / limit));
      if (page > lastPage) setPage(lastPage);
      else mutate();
    } catch (err) {
      message.error(err?.message || "Xóa gói học thất bại");
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
    type,
    setType,
    fetchData,
    handleDelete,
  };
}
