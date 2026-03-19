import { useEffect } from "react";
import { App } from "antd";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import useSWR from "swr";
import studentService from "../../../services/studentService";

export function useStudentList() {
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
  const [branchId, setBranchId] = useQueryState(
    "branchId",
    parseAsString.withDefault(""),
  );
  const [packageId, setPackageId] = useQueryState(
    "packageId",
    parseAsString.withDefault(""),
  );

  const swrKey = ["students", page, limit, search, branchId, packageId];

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    async () => {
      const params = { page, limit };
      if (search) params.search = search;
      if (branchId) params.branchId = Number(branchId);
      if (packageId) params.packageId = Number(packageId);

      const response = await studentService.list(params);
      return response?.data ?? { items: [], pagination: { total: 0 } };
    },
    {
      keepPreviousData: true,
    },
  );

  useEffect(() => {
    if (error) {
      message.error(error?.message || "Không thể tải danh sách học viên");
    }
  }, [error, message]);

  const items = data?.items ?? [];
  const total = data?.pagination?.total ?? 0;
  const loading = isLoading || isValidating;
  const fetchData = () => mutate();

  const handleDelete = async (id) => {
    try {
      await studentService.remove(id);
      message.success("Xóa học viên thành công");
      const lastPage = Math.max(1, Math.ceil((total - 1) / limit));
      if (page > lastPage) setPage(lastPage);
      else mutate();
    } catch (err) {
      message.error(err?.message || "Xóa học viên thất bại");
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
    branchId,
    setBranchId,
    packageId,
    setPackageId,
    fetchData,
    handleDelete,
  };
}
