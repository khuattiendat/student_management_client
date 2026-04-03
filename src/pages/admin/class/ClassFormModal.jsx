import { useEffect, useMemo, useRef, useState } from "react";
import {
  App,
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Table,
  TimePicker,
  Typography,
} from "antd";
import dayjs from "dayjs";
import classService from "../../../services/classService";
import teacherService from "../../../services/teacherService";
import studentService from "../../../services/studentService";
import {
  classOptions,
  certificateOptions,
  generalProgramOptions,
  subjectOptions,
} from "../package/packageFormOptions";
import { comboTypeLabels } from "../package/_columns";

const { Text } = Typography;

const classTypeOptions = [
  { label: "Phổ thông", value: "general" },
  { label: "Chứng chỉ", value: "certificate" },
  { label: "Các môn trên trường", value: "school_subject" },
];

const statusOptions = [
  { label: "Hoạt động", value: "active" },
  { label: "Ngừng hoạt động", value: "inactive" },
  { label: "Đã hoàn thành", value: "completed" },
];

const weekdayOptions = [
  { label: "Chủ nhật", value: 0 },
  { label: "Thứ 2", value: 1 },
  { label: "Thứ 3", value: 2 },
  { label: "Thứ 4", value: 3 },
  { label: "Thứ 5", value: 4 },
  { label: "Thứ 6", value: 5 },
  { label: "Thứ 7", value: 6 },
];

const buildTimeValue = (timeText) => {
  if (!timeText) return undefined;
  const [hourText, minuteText] = String(timeText).split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return undefined;
  }

  return dayjs().hour(hour).minute(minute).second(0);
};

const getScheduleValidationError = (weekdays = [], scheduleByWeekday = {}) => {
  if (!Array.isArray(weekdays) || weekdays.length === 0) {
    return "Vui lòng chọn ít nhất 1 thứ học";
  }

  for (const weekday of weekdays) {
    const schedule = scheduleByWeekday?.[weekday];
    const startTime = schedule?.startTime;
    const endTime = schedule?.endTime;

    if (!startTime || !endTime) {
      return "Vui lòng chọn Lịch học chi tiết cho tất cả các thứ đã chọn";
    }

    if (!dayjs(startTime).isBefore(dayjs(endTime))) {
      return "Giờ bắt đầu phải nhỏ hơn Giờ kết thúc";
    }
  }

  return null;
};

const buildScheduleByWeekdayValue = (detail = {}) => {
  const weekdays = Array.isArray(detail?.weekdays) ? detail.weekdays : [];
  const rawSchedule = detail?.scheduleByWeekday ?? {};
  const defaultStartTime = buildTimeValue(detail?.startTime);
  const defaultEndTime = buildTimeValue(detail?.endTime);

  if (weekdays.length === 0) {
    return {};
  }

  return Object.fromEntries(
    weekdays.map((weekday) => {
      const schedule = rawSchedule?.[weekday] ?? rawSchedule?.[String(weekday)];

      return [
        weekday,
        {
          startTime: buildTimeValue(schedule?.startTime) ?? defaultStartTime,
          endTime: buildTimeValue(schedule?.endTime) ?? defaultEndTime,
        },
      ];
    }),
  );
};

const ClassFormModal = ({
  open,
  onClose,
  editing,
  onSaved,
  branchOptions = [],
  teacherOptions = [],
  packageOptions = [],
  studentOptions = [],
}) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [branchTeacherOptions, setBranchTeacherOptions] =
    useState(teacherOptions);
  const [branchStudentOptions, setBranchStudentOptions] =
    useState(studentOptions);
  const [loadingBranchTeachers, setLoadingBranchTeachers] = useState(false);
  const [loadingBranchStudents, setLoadingBranchStudents] = useState(false);
  const [curriculumFilter, setCurriculumFilter] = useState("");
  const [certificateTypeFilter, setCertificateTypeFilter] = useState("");
  const [comboTypeFilter, setComboTypeFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [scheduleByWeekday, setScheduleByWeekday] = useState({});
  const prevBranchIdRef = useRef();

  const selectedBranchId = Form.useWatch("branchId", form);
  const selectedClassType = Form.useWatch("type", form);
  const selectedStudentIds = Form.useWatch("studentIds", form);
  const selectedPackageIds = Form.useWatch("packageIds", form);
  const selectedWeekdays = Form.useWatch("weekdays", form);

  const selectedStudents = useMemo(() => {
    const selectedIdSet = new Set(selectedStudentIds ?? []);
    return branchStudentOptions.filter((student) =>
      selectedIdSet.has(student.value),
    );
  }, [selectedStudentIds, branchStudentOptions]);

  useEffect(() => {
    const loadEditingData = async () => {
      if (!open) return;

      setBranchTeacherOptions(teacherOptions);
      setBranchStudentOptions(studentOptions);
      prevBranchIdRef.current = undefined;

      if (!editing) {
        form.setFieldsValue({
          name: "",
          type: "general",
          branchId: undefined,
          roomName: "Phòng 301",
          teacherId: undefined,
          packageIds: [],
          weekdays: [],
          startDate: undefined,
          startTime: undefined,
          endTime: undefined,
          status: "active",
          studentIds: [],
        });
        setScheduleByWeekday({});
        return;
      }

      setLoadingDetail(true);
      try {
        const response = await classService.detail(editing.id);
        const detail = response?.data ?? editing;

        form.setFieldsValue({
          name: detail?.name ?? "",
          type: detail?.type ?? "general",
          branchId: detail?.branchId ?? detail?.branch?.id ?? undefined,
          roomName: detail?.roomName ?? "",
          teacherId: detail?.teacherId ?? detail?.teacher?.id ?? undefined,
          packageIds:
            detail?.packageIds?.length > 0
              ? detail.packageIds
              : detail?.packages?.length > 0
                ? detail.packages.map((pkg) => pkg.id)
                : detail?.packageId
                  ? [detail.packageId]
                  : detail?.package?.id
                    ? [detail.package.id]
                    : [],
          weekdays: detail?.weekdays ?? [],
          startDate: detail?.startDate ? dayjs(detail.startDate) : undefined,
          startTime: buildTimeValue(detail?.startTime),
          endTime: buildTimeValue(detail?.endTime),
          status: detail?.status ?? "active",
          studentIds: (detail?.students ?? []).map((student) => student.id),
        });
        setScheduleByWeekday(buildScheduleByWeekdayValue(detail));
      } catch (err) {
        message.error(err?.message || "Không thể tải chi tiết lớp học");
      } finally {
        setLoadingDetail(false);
      }
    };

    loadEditingData();
  }, [open, editing, form, message, teacherOptions, studentOptions]);

  useEffect(() => {
    if (!open) return;
    setCurriculumFilter("");
    setCertificateTypeFilter("");
    setComboTypeFilter("");
    setSubjectFilter("");
    setClassFilter("");
  }, [open]);

  const filteredPackageOptions = useMemo(() => {
    if (!editing) {
      if (!selectedClassType) return [];

      if (selectedClassType === "general") {
        if (!curriculumFilter) return [];
      }

      if (selectedClassType === "certificate" && !certificateTypeFilter) {
        return [];
      }

      if (selectedClassType === "school_subject") {
        if (!subjectFilter || !classFilter) {
          return [];
        }
      }
    }

    return packageOptions.filter((pkg) => {
      if (selectedClassType && pkg.type !== selectedClassType) {
        return false;
      }

      const info = pkg.info ?? {};

      if (selectedClassType === "general") {
        if (curriculumFilter && info.curriculum !== curriculumFilter) {
          return false;
        }

        if (curriculumFilter === "chinese") {
          if (comboTypeFilter && info.comboType !== comboTypeFilter) {
            return false;
          }
        }
      }

      if (selectedClassType === "certificate") {
        if (
          certificateTypeFilter &&
          info.certificateType !== certificateTypeFilter
        ) {
          return false;
        }
      }

      if (selectedClassType === "school_subject") {
        if (subjectFilter && info.subject !== subjectFilter) {
          return false;
        }

        if (classFilter && info.class !== classFilter) {
          return false;
        }
      }

      return true;
    });
  }, [
    classFilter,
    certificateTypeFilter,
    comboTypeFilter,
    curriculumFilter,
    editing,
    packageOptions,
    selectedClassType,
    subjectFilter,
  ]);

  const canShowPackageCheckbox = useMemo(() => {
    if (editing) return true;

    if (!selectedClassType) return false;

    if (selectedClassType === "general") {
      if (!curriculumFilter) return false;
      return true;
    }

    if (selectedClassType === "certificate") {
      return Boolean(certificateTypeFilter);
    }

    if (selectedClassType === "school_subject") {
      return Boolean(subjectFilter && classFilter);
    }

    return false;
  }, [
    certificateTypeFilter,
    classFilter,
    curriculumFilter,
    editing,
    selectedClassType,
    subjectFilter,
  ]);

  useEffect(() => {
    if (!open || editing) return;
    form.setFieldValue("packageIds", []);
  }, [
    classFilter,
    certificateTypeFilter,
    comboTypeFilter,
    curriculumFilter,
    editing,
    form,
    open,
    selectedClassType,
    subjectFilter,
  ]);

  useEffect(() => {
    if (!open || editing || !canShowPackageCheckbox) return;

    const currentSelected = form.getFieldValue("packageIds") ?? [];

    if (filteredPackageOptions.length === 1) {
      const onlyOptionId = filteredPackageOptions[0]?.value;
      if (
        onlyOptionId !== undefined &&
        (currentSelected.length !== 1 || currentSelected[0] !== onlyOptionId)
      ) {
        form.setFieldValue("packageIds", [onlyOptionId]);
      }
      return;
    }

    if (currentSelected.length > 0) {
      const validIds = new Set(
        filteredPackageOptions.map((item) => item.value),
      );
      const nextSelected = currentSelected.filter((id) => validIds.has(id));
      if (nextSelected.length !== currentSelected.length) {
        form.setFieldValue("packageIds", nextSelected);
      }
    }
  }, [canShowPackageCheckbox, editing, filteredPackageOptions, form, open]);

  useEffect(() => {
    const loadBranchDependencies = async () => {
      if (!open) return;

      const selectedPackageIdList = Array.isArray(selectedPackageIds)
        ? selectedPackageIds
        : [];

      if (!selectedBranchId) {
        setBranchTeacherOptions([]);
        setBranchStudentOptions([]);
        if (prevBranchIdRef.current !== undefined) {
          form.setFieldsValue({
            teacherId: undefined,
            studentIds: [],
          });
        }
        prevBranchIdRef.current = selectedBranchId;
        return;
      }

      const hasBranchChanged =
        prevBranchIdRef.current !== undefined &&
        prevBranchIdRef.current !== selectedBranchId;

      prevBranchIdRef.current = selectedBranchId;

      setLoadingBranchTeachers(true);
      setLoadingBranchStudents(true);

      try {
        const teacherPromise = teacherService.list({
          page: 1,
          limit: 1000,
          status: "active",
          branchId: Number(selectedBranchId),
        });

        const studentPromise =
          selectedPackageIdList.length > 0
            ? studentService.byEnrollments({
                branchId: String(selectedBranchId),
                packageIds: selectedPackageIdList,
              })
            : Promise.resolve({ data: { items: [] } });

        const [teacherResponse, studentResponse] = await Promise.all([
          teacherPromise,
          studentPromise,
        ]);

        const nextTeacherOptions = (teacherResponse?.data?.items ?? []).map(
          (teacher) => ({
            label: teacher.name,
            value: teacher.id,
          }),
        );

        const nextStudentOptions = (studentResponse?.data?.items ?? []).map(
          (student) => ({
            label: `${student.name}${student.phone ? ` - ${student.phone}` : ""}`,
            value: student.id,
            name: student.name,
            phone: student.phone,
            branchName: student?.branch?.name,
          }),
        );

        setBranchTeacherOptions(nextTeacherOptions);
        setBranchStudentOptions(nextStudentOptions);

        if (hasBranchChanged) {
          form.setFieldsValue({
            teacherId: undefined,
            studentIds: [],
          });
          return;
        }

        const currentTeacherId = form.getFieldValue("teacherId");
        const currentStudentIds = form.getFieldValue("studentIds") ?? [];

        if (
          currentTeacherId &&
          !nextTeacherOptions.some(
            (option) => option.value === currentTeacherId,
          )
        ) {
          form.setFieldValue("teacherId", undefined);
        }

        const validStudentIds = currentStudentIds.filter((id) =>
          nextStudentOptions.some((option) => option.value === id),
        );

        if (validStudentIds.length !== currentStudentIds.length) {
          form.setFieldValue("studentIds", validStudentIds);
        }
      } catch (err) {
        message.error(err?.message || "Không thể tải danh sách theo cơ sở");
        setBranchTeacherOptions([]);
        setBranchStudentOptions([]);
      } finally {
        setLoadingBranchTeachers(false);
        setLoadingBranchStudents(false);
      }
    };

    loadBranchDependencies();
  }, [selectedBranchId, selectedPackageIds, open, form, message]);

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const selectedPackageIdList = Array.isArray(values.packageIds)
        ? values.packageIds
        : [];
      if (selectedPackageIdList.length === 0) {
        message.error("Vui lòng chọn ít nhất 1 gói học");
        setSaving(false);
        return;
      }

      const scheduleValidationError = getScheduleValidationError(
        values.weekdays,
        scheduleByWeekday,
      );
      if (scheduleValidationError) {
        message.error(scheduleValidationError);
        setSaving(false);
        return;
      }

      const payload = {
        name: values.name,
        type: values.type,
        branchId: values.branchId,
        roomName: values.roomName,
        teacherId: values.teacherId,
        packageIds: selectedPackageIdList,
        weekdays: values.weekdays ?? [],
        status: values.status,
        studentIds: values.studentIds ?? [],
      };

      payload.scheduleByWeekday = Object.fromEntries(
        (values.weekdays ?? []).map((day) => [
          day,
          {
            startTime:
              scheduleByWeekday[day]?.startTime?.format("HH:mm") || null,
            endTime: scheduleByWeekday[day]?.endTime?.format("HH:mm") || null,
          },
        ]),
      );

      if (editing) {
        await classService.update(editing.id, payload);
        message.success("Cập nhật lớp học thành công");
      } else {
        payload.startDate = values.startDate?.format("YYYY-MM-DD");
        await classService.create(payload);
        message.success("Thêm lớp học thành công");
      }
      handleClose();
      onSaved({ created: !editing });
    } catch (err) {
      message.error(
        err?.message ||
          (editing ? "Cập nhật lớp học thất bại" : "Thêm lớp học thất bại"),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editing ? "Cập nhật lớp học" : "Thêm lớp học mới"}
      open={open}
      onCancel={handleClose}
      footer={null}
      destroyOnHidden
      width={1100}
      confirmLoading={loadingDetail}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        className="mt-4 grid grid-cols-1 gap-x-4 md:grid-cols-2"
      >
        <Form.Item
          label="Tên lớp"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên lớp" }]}
        >
          <Input placeholder="Nhập tên lớp học" />
        </Form.Item>
        <Form.Item
          label="Phòng học"
          name="roomName"
          rules={[{ required: true, message: "Vui lòng nhập tên lớp" }]}
        >
          <Select
            options={[
              { label: "Phòng 01", value: "Phòng 01" },
              { label: "Phòng 02", value: "Phòng 02" },
              { label: "Phòng 03", value: "Phòng 03" },
            ]}
            placeholder="Chọn phòng học"
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Form.Item
          label="Loại lớp"
          name="type"
          rules={[{ required: true, message: "Vui lòng chọn loại lớp" }]}
        >
          <Select
            options={classTypeOptions}
            placeholder="Chọn loại lớp"
            onChange={() => {
              setCurriculumFilter("");
              setCertificateTypeFilter("");
              setComboTypeFilter("");
              setSubjectFilter("");
              setClassFilter("");
              if (!editing) {
                form.setFieldValue("packageIds", []);
              }
            }}
          />
        </Form.Item>

        <Form.Item
          label="Cơ sở"
          name="branchId"
          rules={[{ required: true, message: "Vui lòng chọn cơ sở" }]}
        >
          <Select
            options={branchOptions}
            placeholder="Chọn cơ sở"
            optionFilterProp="label"
            showSearch
          />
        </Form.Item>

        <Form.Item
          label="Giáo viên"
          name="teacherId"
          rules={[{ required: true, message: "Vui lòng chọn giáo viên" }]}
        >
          <Select
            options={branchTeacherOptions}
            placeholder={
              selectedBranchId ? "Chọn giáo viên" : "Vui lòng chọn cơ sở trước"
            }
            optionFilterProp="label"
            showSearch
            disabled={!selectedBranchId}
            loading={loadingBranchTeachers}
          />
        </Form.Item>

        <Form.Item label="Gói học" className="md:col-span-2">
          <div className="space-y-3">
            {!editing ? (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {selectedClassType === "general" ? (
                  <>
                    <Select
                      value={curriculumFilter}
                      options={[
                        { label: "Tất cả chương trình", value: "" },
                        ...generalProgramOptions,
                      ]}
                      placeholder="Chương trình"
                      onChange={(value) => {
                        setCurriculumFilter(value || "");
                      }}
                    />
                  </>
                ) : null}

                {selectedClassType === "certificate" ? (
                  <Select
                    value={certificateTypeFilter}
                    options={[
                      { label: "Tất cả chứng chỉ", value: "" },
                      ...certificateOptions,
                    ]}
                    placeholder="Loại chứng chỉ"
                    onChange={(value) => setCertificateTypeFilter(value || "")}
                  />
                ) : null}

                {selectedClassType === "school_subject" ? (
                  <>
                    <Select
                      value={subjectFilter}
                      options={[
                        { label: "Tất cả môn", value: "" },
                        ...subjectOptions,
                      ]}
                      placeholder="Môn học"
                      onChange={(value) => setSubjectFilter(value || "")}
                    />

                    <Select
                      value={classFilter}
                      options={[
                        { label: "Tất cả khối", value: "" },
                        ...classOptions,
                      ]}
                      placeholder="Khối lớp"
                      onChange={(value) => setClassFilter(value || "")}
                    />
                  </>
                ) : null}
              </div>
            ) : null}

            {canShowPackageCheckbox ? (
              <Form.Item
                name="packageIds"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất 1 gói học",
                  },
                ]}
                className="mb-0"
              >
                <Checkbox.Group className="flex w-full gap-2">
                  {filteredPackageOptions
                    ?.slice()
                    .sort(
                      (a, b) => (b.totalSessions ?? 0) - (a.totalSessions ?? 0),
                    )
                    ?.map((pkg) => (
                      <Checkbox
                        key={pkg.value}
                        value={pkg.value}
                        className="m-0"
                      >
                        <div className="py-0.5">
                          <div className="font-medium">
                            {pkg.name || pkg.label} (
                            {pkg?.totalSessions ?? "N/A"} buổi){" "}
                            {pkg?.info?.comboType
                              ? `(${comboTypeLabels[pkg?.info?.comboType]})`
                              : ""}
                          </div>
                        </div>
                      </Checkbox>
                    ))}
                </Checkbox.Group>
              </Form.Item>
            ) : null}

            {!editing &&
            canShowPackageCheckbox &&
            filteredPackageOptions.length === 0 ? (
              <Text type="secondary">Không có gói học phù hợp bộ lọc</Text>
            ) : null}
          </div>
        </Form.Item>

        <Form.Item
          label="Ngày khai giảng"
          name="startDate"
          rules={
            editing
              ? []
              : [{ required: true, message: "Vui lòng chọn Ngày khai giảng" }]
          }
        >
          <DatePicker
            className="w-full!"
            format="DD/MM/YYYY"
            disabled={Boolean(editing)}
            placeholder={
              editing
                ? "Ngày khai giảng không thể chỉnh sửa"
                : "Chọn Ngày khai giảng"
            }
          />
        </Form.Item>

        <Form.Item
          label="Lịch học cố định"
          name="weekdays"
          rules={[
            { required: true, message: "Vui lòng chọn ít nhất 1 thứ học" },
          ]}
        >
          <Select
            mode="multiple"
            options={weekdayOptions}
            placeholder="Chọn thứ học"
            optionFilterProp="label"
          />
        </Form.Item>

        {(selectedWeekdays?.length ?? 0) > 0 ? (
          <Form.Item label="Lịch học chi tiết" className="md:col-span-2 mb-4">
            <Table
              rowKey="weekday"
              dataSource={(selectedWeekdays ?? []).map((day) => ({
                weekday: day,
                label: weekdayOptions.find((o) => o.value === day)?.label,
              }))}
              pagination={false}
              size="small"
              bordered
              scroll={{ x: "max-content" }}
              columns={[
                {
                  title: "Thứ",
                  dataIndex: "label",
                  key: "label",
                  width: 100,
                },
                {
                  title: "Giờ bắt đầu",
                  key: "startTime",
                  width: 150,
                  render: (_, record) => (
                    <TimePicker
                      className="w-full!"
                      format="HH:mm"
                      minuteStep={5}
                      value={
                        scheduleByWeekday[record.weekday]?.startTime || null
                      }
                      onChange={(time) => {
                        setScheduleByWeekday({
                          ...scheduleByWeekday,
                          [record.weekday]: {
                            ...scheduleByWeekday[record.weekday],
                            startTime: time,
                          },
                        });
                      }}
                    />
                  ),
                },
                {
                  title: "Giờ kết thúc",
                  key: "endTime",
                  width: 150,
                  render: (_, record) => (
                    <TimePicker
                      className="w-full!"
                      format="HH:mm"
                      minuteStep={5}
                      value={scheduleByWeekday[record.weekday]?.endTime || null}
                      onChange={(time) => {
                        setScheduleByWeekday({
                          ...scheduleByWeekday,
                          [record.weekday]: {
                            ...scheduleByWeekday[record.weekday],
                            endTime: time,
                          },
                        });
                      }}
                    />
                  ),
                },
              ]}
            />
          </Form.Item>
        ) : null}

        <Form.Item
          label="Trạng thái"
          name="status"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
        >
          <Select options={statusOptions} placeholder="Chọn trạng thái" />
        </Form.Item>

        <Form.Item label="Học sinh" name="studentIds" className="md:col-span-2">
          <Select
            mode="multiple"
            options={branchStudentOptions}
            placeholder={
              !selectedBranchId
                ? "Vui lòng chọn cơ sở trước"
                : (selectedPackageIds?.length ?? 0) === 0
                  ? "Vui lòng chọn gói học trước"
                  : "Chọn học sinh"
            }
            optionFilterProp="label"
            showSearch
            disabled={
              !selectedBranchId || (selectedPackageIds?.length ?? 0) === 0
            }
            loading={loadingBranchStudents}
          />
        </Form.Item>

        <div className="md:col-span-2">
          <Table
            rowKey="value"
            dataSource={selectedStudents}
            pagination={false}
            size="small"
            bordered
            scroll={{ x: "max-content" }}
            locale={{ emptyText: "Chưa chọn học sinh" }}
            columns={[
              {
                title: "Họ tên",
                dataIndex: "name",
                key: "name",
                render: (value) => value || "—",
              },
              {
                title: "Số điện thoại",
                dataIndex: "phone",
                key: "phone",
                render: (value) => value || "—",
              },
              {
                title: "Cơ sở",
                dataIndex: "branchName",
                key: "branchName",
                render: (value) => value || "—",
              },
            ]}
          />
        </div>

        <div className="flex justify-end gap-2 md:col-span-2">
          <Button onClick={handleClose}>Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={saving || loadingDetail}
            disabled={saving || loadingDetail}
          >
            {editing ? "Cập nhật" : "Thêm mới"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ClassFormModal;
