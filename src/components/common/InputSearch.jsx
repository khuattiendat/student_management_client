import { useEffect, useState } from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useDebounce } from "../../hooks/useDebounce";

/**
 * InputSearch — tìm kiếm tự động khi gõ với debounce.
 *
 * @param {string}   value         Giá trị hiện tại (controlled từ ngoài)
 * @param {function} onSearch      Callback nhận keyword sau khi debounce
 * @param {string}   placeholder
 * @param {number}   debounceMs    Thời gian debounce (mặc định 400ms)
 * @param {string}   className
 */
const InputSearch = ({
  value: externalValue = "",
  onSearch,
  placeholder = "Tìm kiếm...",
  debounceMs = 500,
  className = "",
}) => {
  const [input, setInput] = useState(externalValue);
  const debounced = useDebounce(input, debounceMs);

  // Khi externalValue thay đổi từ bên ngoài (ví dụ clear URL param)
  useEffect(() => {
    setInput(externalValue);
  }, [externalValue]);

  // Khi debounced thay đổi thì báo ra ngoài
  useEffect(() => {
    onSearch?.(debounced);
  }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Input
      placeholder={placeholder}
      prefix={<SearchOutlined className="text-gray-400" />}
      value={input}
      onChange={(e) => setInput(e.target.value)}
      allowClear
      onClear={() => setInput("")}
      className={className}
    />
  );
};

export default InputSearch;
