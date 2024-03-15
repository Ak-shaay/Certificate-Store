import React, { useState } from "react";
import Select from "react-dropdown-select";
import "./MultiSelect.css";

const MultiSelect = ({ options, placeholder, onChange }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleChange = (selectedItems) => {
    setSelectedOptions(selectedItems);
    if (onChange) {
      onChange(selectedItems);
    }
  };

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
};

export default MultiSelect;
