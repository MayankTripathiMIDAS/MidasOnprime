import React from "react";

const InputField = ({
  label,
  value,
  type,
  placeholder,
  onChange,
  onBlur,
  id,
  name,
  onClick,
  disabled,
  style,
  maxLength,
  required,
  errors,
  touched,
}) => {
  return (
    <div className={label === "Request Time Off" ? "col-md-2" : "col-md-3"}>
      <label className="m-2 text-dark" style={style}>
        {label}
      </label>
      <input
        type={type}
        className={`form-control ${touched && errors ? "is-invalid" : ""}`} // Add error class if touched and has error
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        name={name}
        required={required}
        onClick={onClick}
        disabled={disabled}
        style={style}
        maxLength={maxLength} // Correct attribute
      />
      {touched &&
        errors &&
        typeof errors === "string" && ( // Ensure errors is a string before rendering
          <div className="text-danger">{errors}</div>
        )}
    </div>
  );
};

export default InputField;
