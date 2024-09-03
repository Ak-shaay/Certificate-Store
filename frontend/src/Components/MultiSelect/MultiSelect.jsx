import React, { useState, forwardRef, useImperativeHandle } from "react";
import Select from "react-dropdown-select";
import "./MultiSelect.css";

const MultiSelect = forwardRef(({ options, placeholder, onChange }, ref) => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleChange = (selectedItems) => {
    setSelectedOptions(selectedItems);
    if (onChange) {
      onChange(selectedItems);
    }
  };

  useImperativeHandle(ref, () => ({
    resetSelectedValues: () => {
      setSelectedOptions([]);
      if (onChange) {
        onChange([]); // Notify parent component about the cleared selections
      }
    },
  }));

  return (
    <Select
      options={options}
      placeholder={placeholder}
      multi
      clearable
      searchable
      className="custom-select"
      closeOnSelect={false}
      values={selectedOptions}
      onChange={handleChange}
    />
  );
});

export default MultiSelect;
