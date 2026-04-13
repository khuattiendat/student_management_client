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
  const [classId, setClassId] = useQueryState(
    "classId",
    parseAsString.withDefault(""),
  );
  const [isCalled, setIsCalled] = useQueryState(
    "isCalled",
    parseAsString.withDefault(""),
  );
  const [isTexted, setIsTexted] = useQueryState(
    "isTexted",
    parseAsString.withDefault(""),
  );
  const [packageType, setPackageType] = useQueryState(
    "packageType",
    parseAsString.withDefault(""),
  );
  const [birthMonth, setBirthMonth] = useQueryState(
    "birthMonth",
    parseAsString.withDefault(""),
  );

  const swrKey = [
    "students",
    page,
    limit,
    search,
    branchId,
    classId,
    isCalled,
    isTexted,
    packageType,
    birthMonth,
  ];

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    swrKey,
    async () => {
      const params = { page, limit };
      if (search) params.search = search;
      if (branchId) params.branchId = Number(branchId);
      if (classId) params.classId = Number(classId);
      if (packageType) params.packageType = packageType;
      if (birthMonth) params.birthMonth = birthMonth;
      if (isCalled !== undefined && isCalled !== "") {
        params.isCalled = Number(isCalled);
      }
      if (isTexted !== undefined && isTexted !== "") {
        params.isTexted = Number(isTexted);
      }

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
    classId,
    setClassId,
    fetchData,
    handleDelete,
    isCalled,
    setIsCalled,
    isTexted,
    setIsTexted,
    packageType,
    setPackageType,
    birthMonth,
    setBirthMonth,
    mutate,
  };
}
