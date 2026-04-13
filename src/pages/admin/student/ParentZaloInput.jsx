import { useEffect, useRef, useState } from "react";
import { Input } from "antd";
import { useDebounce } from "../../../hooks/useDebounce";

const ParentZaloInput = ({ parent, onUpdateZaloName }) => {
  const [localValue, setLocalValue] = useState(parent?.zaloName || "");
  const debouncedValue = useDebounce(localValue, 600);
  const skipFirstDebouncedRun = useRef(true);

  useEffect(() => {
    if (!parent?.id) return;

    // Prevent API call on first render for each row.
    if (skipFirstDebouncedRun.current) {
      skipFirstDebouncedRun.current = false;
      return;
    }

    const sourceValue = parent?.zaloName || "";
    if (debouncedValue === sourceValue) return;

    onUpdateZaloName(parent.id, debouncedValue);
  }, [debouncedValue, onUpdateZaloName, parent]);

  return (
    <Input
      value={localValue}
      placeholder="—"
      onChange={(e) => setLocalValue(e.target.value)}
    />
  );
};

export default ParentZaloInput;
