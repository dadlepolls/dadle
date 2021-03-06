import { Input } from "antd";
import React from "react";

const InputWithInlineComponent = ({
  compact = false,
  placeholder,
  style,
  onChange,
  inlineComponent,
  defaultValue,
  value,
}: {
  compact?: boolean;
  placeholder?: string;
  style?: React.CSSProperties;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  inlineComponent?: React.ReactNode;
  defaultValue?: string | number | readonly string[];
  value?: string | number | readonly string[];
}) => {
  return (
    <Input.Group compact={compact}>
      <Input
        defaultValue={defaultValue}
        type="text"
        placeholder={placeholder}
        style={style}
        onChange={onChange}
        value={value}
      />
      {inlineComponent}
    </Input.Group>
  );
};

export { InputWithInlineComponent };

