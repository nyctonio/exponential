import { usePlBrokerageSharingStore } from '@/store/advance-settings/pl-brokerage-sharing';
import React, { useEffect, useState } from 'react';
import useFetch from '@/hooks/useFetch';
import { BorderInput } from '@/components/inputs/text';
import { PrimaryButton } from '@/components/inputs/button';
import { CloseCircleOutlined } from '@ant-design/icons';
import { SelectAntdBorder } from '@/components/inputs/select';
import Routes from '@/utils/routes';
import Toast from '@/utils/common/toast';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import validateUsername from '@/utils/common/validateUsername';

function SearchClientHeader() {
  const { tableData, setTableData } = usePlBrokerageSharingStore();
  const { apiCall } = useFetch();
  const [username, setUsername] = useState('');
  const searchParams = useSearchParams();

  const submitHandler = async () => {
    if (username.trim().length == 0) {
      toast.error('Please enter valid username');
      return;
    }
    if (!searchParams.get('edit')) {
      //to validate
      let validationResult = validateUsername(username);
      if (validationResult.status == false) {
        toast.error(validationResult.message);
        return;
      }
    }
    setTableData({ ...tableData, loading: true, fetched: false });
    const _toast = new Toast('Fetching Records!!!');
    const pldataPromise = apiCall(
      Routes.GET_USER_PL_SHARING,
      {
        username: username,
      },
      false
    );
    const brokerageDataPromise = apiCall(
      Routes.GET_USER_BROKERAGE_SHARING,
      {
        username: username,
      },
      false
    );
    const rentShareDataPromise = apiCall(
      Routes.GET_USER_RENT_SHARING,
      { username },
      false
    );
    const [pldata, brokerageData, rentData] = await Promise.all([
      pldataPromise,
      brokerageDataPromise,
      rentShareDataPromise,
    ]);
    // Now you can use pldata and brokerageData as needed.

    if (pldata.status && brokerageData.status && rentData.status) {
      _toast.success(pldata.message);
      console.log(pldata.data, brokerageData.data);
      setTableData({
        ...tableData,
        brokerageSharing: brokerageData.data,
        plSharing: pldata.data,
        loading: false,
        fetched: true,
        rentSharing: rentData.data,
        username: username,
      });
    } else {
      setTableData({
        ...tableData,
        brokerageSharing: [],
        plSharing: [],
        loading: false,
        fetched: false,
      });
      _toast.error(pldata.message || brokerageData.message);
    }
  };

  return (
    <>
      <form
        className="flex flex-col space-y-3 md:flex-row justify-between"
        onSubmit={(e) => {
          e.preventDefault();
          submitHandler();
        }}
      >
        <div className="flex space-x-3">
          <BorderInput
            required={true}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            className="!py-[0.22rem]"
            placeholder="Search User"
          />
          <PrimaryButton type="submit" className="!py-[0.47rem] !min-w-[20px]">
            Search
          </PrimaryButton>
          {tableData.fetched && (
            <div
              className="flex flex-row items-center space-x-1 cursor-pointer"
              onClick={() => {
                setTableData({
                  ...tableData,
                  fetched: false,
                  brokerageSharing: [],
                  plSharing: [],
                  username: '',
                });
              }}
            >
              <CloseCircleOutlined className=" text-[var(--primary-shade-b)]" />
              <span className="underline text-[var(--primary-shade-b)]">
                Reset
              </span>
            </div>
          )}
        </div>
        <div className="flex">
          {tableData.fetched && (
            <div className="flex justify-center items-center">
              PL / Brokerage Sharing
              <span className="font-bold pl-1 text-[var(--primary-shade-a)]">
                {tableData.username}
              </span>
            </div>
          )}
        </div>
      </form>
    </>
  );
}

export default SearchClientHeader;
