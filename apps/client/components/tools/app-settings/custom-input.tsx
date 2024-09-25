import { BorderInput } from '@/components/inputs/text';
import { useManageAppSettingsStore } from '@/store/tools/manageappsettings';
import React, { useEffect, useState } from 'react';

type Props = {
  value: string;
  setValue: Function;
  onSave: Function;
  id: string;
  placeholder: string;
  type: 'number' | 'text';
};

function CustomInput({
  onSave,
  setValue,
  value,
  id,
  placeholder,
  type,
}: Props) {
  const [showInput, setShowInput] = useState(false);

  const [inputValue, setInputValue] = useState(value);

  const { editMode } = useManageAppSettingsStore();

  useEffect(() => {
    setShowInput(false);

    return () => {
      setShowInput(false);
    };
  }, []);
  return (
    <>
      {showInput && editMode ? (
        <div className="w-full flex flex-row justify-start">
          <form
            className="w-full px-0"
            onSubmit={(e) => {
              e.preventDefault();
              onSave(inputValue);
              setShowInput(false);
            }}
          >
            <BorderInput
              type={type}
              id={id}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
              }}
              onBlur={() => {
                setShowInput(false);
                setInputValue(value);
              }}
              autoFocus={true}
              required
              className="w-3/4 h-5"
              placeholder={placeholder}
            />
          </form>
        </div>
      ) : (
        <div
          className={`w-full text-left ${
            editMode ? 'cursor-pointer' : 'cursor-not-allowed'
          }`}
          onClick={() => {
            setShowInput(true);
          }}
        >
          {value}
        </div>
      )}
    </>
  );
}

export default CustomInput;
