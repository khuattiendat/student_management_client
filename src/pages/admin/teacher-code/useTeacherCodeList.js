import { useEffect } from "react";
import { App } from "antd";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import useSWR from "swr";
import teacherCodeService from "../../../services/teacherCodeService";

export function useTeacherCodeList() {
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
  const [teacherId, setTeacherId] = useQueryState("teacherId", parseAsInteger);

  const swrKey = ["teacher-codes", page, limit, search, teacherId, status];

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    async () => {
      const params = { page, limit };
      if (search) params.search = search;
      if (teacherId) params.teacherId = teacherId;
      if (status) params.status = status;

      const response = await teacherCodeService.list(params);
      return response?.data ?? { items: [], pagination: { total: 0 } };
    },
    {
      keepPreviousData: true,
    },
  );

  useEffect(() => {
    if (error) {
      message.error(error?.message || "Không thể tải danh sách mã giáo viên");
    }
  }, [error, message]);

  const items = data?.items ?? [];
  const total = data?.pagination?.total ?? 0;
  const loading = isLoading || isValidating;
  const fetchData = () => mutate();

  const handleDelete = async (id) => {
    try {
      await teacherCodeService.remove(id);
      message.success("Xóa mã giáo viên thành công");

      const lastPage = Math.max(1, Math.ceil((total - 1) / limit));
      if (page > lastPage) {
        setPage(lastPage);
      } else {
        mutate();
      }
    } catch (err) {
      message.error(err?.message || "Xóa mã giáo viên thất bại");
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
    teacherId,
    setTeacherId,
    fetchData,
    handleDelete,
    status,
    setStatus,
  };
}
