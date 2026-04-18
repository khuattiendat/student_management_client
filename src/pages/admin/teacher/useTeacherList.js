import { useEffect } from "react";
import { App } from "antd";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import useSWR from "swr";
import teacherService from "../../../services/teacherService";

export function useTeacherList() {
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
  const [branchId, setBranchId] = useQueryState(
    "branchId",
    parseAsString.withDefault(""),
  );
  const [role, setRole] = useQueryState("role", parseAsString.withDefault(""));

  const swrKey = ["teachers", page, limit, search, status, branchId, role];

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    async () => {
      const params = { page, limit };
      if (search) params.search = search;
      if (status) params.status = status;
      if (branchId) params.branchId = Number(branchId);
      if (role) params.role = role;
      const response = await teacherService.list(params);
      return response?.data ?? { items: [], pagination: { total: 0 } };
    },
    {
      keepPreviousData: true,
    },
  );

  useEffect(() => {
    if (error) {
      message.error(error?.message || "Không thể tải danh sách giáo viên");
    }
  }, [error, message]);

  const items = data?.items ?? [];
  const total = data?.pagination?.total ?? 0;
  const loading = isLoading || isValidating;
  const fetchData = () => mutate();

  const handleDelete = async (id) => {
    try {
      await teacherService.remove(id);
      message.success("Xóa giáo viên thành công");
      const lastPage = Math.max(1, Math.ceil((total - 1) / limit));
      if (page > lastPage) setPage(lastPage);
      else mutate();
    } catch (err) {
      message.error(err?.message || "Xóa giáo viên thất bại");
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
    role,
    setRole,
  };
}
