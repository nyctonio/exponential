import { H1 } from '@/components/inputs/heading';
import { BorderInput } from '@/components/inputs/text';
import { useManageAppSettingsStore } from '@/store/tools/manageappsettings';
import { AutoComplete, Input } from 'antd';
import React, { useState } from 'react';

function AppSettingsForm() {
  const { keyOptions, createFormData, setCreateFormData } =
    useManageAppSettingsStore();

  const [options, setOptions] = useState(
    keyOptions.map((a) => {
      return { value: a, label: a };
    })
  );

  const textSearchHandler = (value: string) => {
    let finalOptions = keyOptions
      .filter((a) => {
        return a.toLocaleLowerCase().includes(value.toLocaleLowerCase());
      })
      .map((a) => {
        return { value: a, label: a };
      });

    setOptions(finalOptions);
  };
  return (
    <div
      style={{
        fontWeight: 300,
      }}
      className="w-full flex flex-row justify-center py-4"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          //   submitHandler();
        }}
        className="grid grid-cols-2 gap-2 w-[80%] place-items-left items-center"
      >
        <h1 className="text-sm text-left font-light text-black">
          Application Setting Key<span className="text-red-800">*</span>
        </h1>
        <AutoComplete
          tabIndex={0}
          autoFocus={true}
          value={createFormData.applicationSettingKey}
          size="middle"
          options={options}
          onSearch={(text) => {
            textSearchHandler(text);
          }}
          onSelect={(value) => {
            setCreateFormData(
              value,
              createFormData.applicationSettingName,
              createFormData.applicationSettingValue,
              createFormData.applicationSettingDisplay,
              createFormData.applicationSettingSort
            );
          }}
          onChange={(value) => {
            setCreateFormData(
              value,
              createFormData.applicationSettingName,
              createFormData.applicationSettingValue,
              createFormData.applicationSettingDisplay,
              createFormData.applicationSettingSort
            );
          }}
          style={{
            width: '100%',
          }}
        >
          <BorderInput />
        </AutoComplete>

        <H1 className="text-sm text-left font-light text-black">
          Application Setting Name <span className="text-red-800">*</span>
        </H1>
        <BorderInput
          value={createFormData.applicationSettingName}
          onChange={(e) => {
            setCreateFormData(
              createFormData.applicationSettingKey,
              e.target.value,
              createFormData.applicationSettingValue,
              createFormData.applicationSettingDisplay,
              createFormData.applicationSettingSort
            );
          }}
          style={{ width: '100%' }}
        />

        <H1 className="text-sm text-left font-light text-black">
          Application Setting Value <span className="text-red-800">*</span>
        </H1>
        <BorderInput
          value={createFormData.applicationSettingValue}
          onChange={(e) => {
            setCreateFormData(
              createFormData.applicationSettingKey,
              createFormData.applicationSettingName,
              e.target.value,
              createFormData.applicationSettingDisplay,
              createFormData.applicationSettingSort
            );
          }}
          style={{ width: '100%' }}
        />

        <H1 className="text-sm text-left font-light text-black">
          Application Display Value <span className="text-red-800">*</span>
        </H1>
        <BorderInput
          value={createFormData.applicationSettingDisplay}
          onChange={(e) => {
            setCreateFormData(
              createFormData.applicationSettingKey,
              createFormData.applicationSettingName,
              createFormData.applicationSettingValue,
              e.target.value,
              createFormData.applicationSettingSort
            );
          }}
          style={{ width: '100%' }}
        />

        <H1 className="text-sm text-left font-light text-black">
          Application Sort Order <span className="text-red-800">*</span>
        </H1>
        <BorderInput
          value={createFormData.applicationSettingSort}
          type="number"
          min={-1}
          onChange={(e) => {
            setCreateFormData(
              createFormData.applicationSettingKey,
              createFormData.applicationSettingName,
              createFormData.applicationSettingValue,
              createFormData.applicationSettingDisplay,
              parseInt(e.target.value)
            );
          }}
          style={{ width: '100%' }}
        />
      </form>
    </div>
  );
}

export default AppSettingsForm;
