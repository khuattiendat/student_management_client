import { Form, Select } from "antd";
import {
  certificateOptions,
  classOptions,
  comboTypeOptions,
  generalProgramOptions,
  subjectOptions,
} from "./packageFormOptions";

const PackageDynamicFields = ({ selectedType }) => {
  if (selectedType === "general") {
    return (
      <>
        <Form.Item
          label="Chương trình học phổ thông"
          name={["info", "curriculum"]}
          rules={[{ required: true, message: "Vui lòng chọn chương trình" }]}
        >
          <Select
            options={generalProgramOptions}
            placeholder="Chọn chương trình học phổ thông"
          />
        </Form.Item>

        <Form.Item
          label="Chọn loại gói"
          name={["info", "comboType"]}
          rules={[{ required: true, message: "Vui lòng chọn combo" }]}
        >
          <Select options={comboTypeOptions} placeholder="Chọn combo" />
        </Form.Item>
      </>
    );
  }

  if (selectedType === "certificate") {
    return (
      <Form.Item
        label="Chứng chỉ"
        name={["info", "certificateType"]}
        rules={[{ required: true, message: "Vui lòng chọn chứng chỉ" }]}
      >
        <Select options={certificateOptions} placeholder="Chọn chứng chỉ" />
      </Form.Item>
    );
  }

  if (selectedType === "school_subject") {
    return (
      <>
        <Form.Item
          label="Môn học"
          name={["info", "subject"]}
          rules={[{ required: true, message: "Vui lòng chọn môn học" }]}
        >
          <Select options={subjectOptions} placeholder="Chọn môn học" />
        </Form.Item>

        <Form.Item
          label="Khối lớp"
          name={["info", "class"]}
          rules={[{ required: true, message: "Vui lòng chọn khối lớp" }]}
        >
          <Select options={classOptions} placeholder="Chọn khối lớp" />
        </Form.Item>

        <Form.Item
          label="Chọn Combo"
          name={["info", "comboType"]}
          rules={[{ required: true, message: "Vui lòng chọn combo" }]}
        >
          <Select options={comboTypeOptions} placeholder="Chọn combo" />
        </Form.Item>
      </>
    );
  }

  return null;
};

export default PackageDynamicFields;
