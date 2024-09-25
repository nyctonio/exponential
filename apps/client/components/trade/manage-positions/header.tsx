import React, { useEffect, useState } from 'react';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';
import Toast from '@/utils/common/toast';
import { useAutoCutSettingsStore } from '@/store/advance-settings/trade-auto-cut-settings';
import { DatePicker, Tooltip } from 'antd';
import { TableBidStopLossSetting } from '@/types/advance-settings/auto-cut-settings';
import { BorderInput, LabeledWrapper } from '@/components/inputs/text';
import { SelectAntdBorder } from '@/components/inputs/select';
import { DatePickerAntd } from '@/components/inputs/date';
import { PrimaryButton } from '@/components/inputs/button';
import { H1 } from '@/components/inputs/heading';
import { I } from '@/components/inputs/tooltip';
import { useManagePositions } from '@/store/trade/managepositions';
import dayjs from 'dayjs';
import { useUserStore } from '@/store/user';

function AutoCutHeader() {
  const { apiCall } = useFetch();
  const { user } = useUserStore();
  const { refreshCount, setRefreshCount, filter, setFilter } =
    useManagePositions();

  return (
    <>
      <div className="flex  items-center space-x-2">
        <H1>
          {user?.userType.constant == 'Client' ? 'My' : 'Manage'} Positions
        </H1>
        <Tooltip placement="top" title={'This is tooltip'}>
          <I text=""></I>
        </Tooltip>
      </div>
      <div
        id="trade-header"
        className="w-full h-full mt-2 overflow-x-scroll flex rounded-xl items-center justify-between "
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setRefreshCount(refreshCount + 1);
          }}
          className="grid grid-cols-2 md:grid-cols-6 gap-3  w-full h-[100%] text-[14px] py-1"
        >
          {user?.userType.constant != 'Client' && (
            <LabeledWrapper label="User Name">
              <BorderInput
                type="text"
                id="search-username"
                value={filter.username}
                onChange={(e) => {
                  setFilter({ ...filter, username: e.target.value });
                }}
                className=""
                placeholder="Search User"
              />
            </LabeledWrapper>
          )}

          <LabeledWrapper label="Exchange">
            <SelectAntdBorder
              defaultValue={'NSE'}
              options={[
                { label: 'All', value: '' },
                { label: 'NSE', value: 'NSE' },
                { label: 'MCX', value: 'MCX' },
                { label: 'FX', value: 'FX' },
                { label: 'Options', value: 'Options' },
              ]}
              className=" bg-white !h-[34.5px]"
              handleChange={(value, option) => {
                setFilter({ ...filter, exchange: value });
              }}
              value={filter.exchange}
            />
          </LabeledWrapper>

          <LabeledWrapper label="Script">
            <BorderInput
              type="text"
              id="search-script"
              value={filter.script}
              onChange={(e) => {
                setFilter({ ...filter, script: e.target.value });
              }}
              className=""
              placeholder="AXISBANK"
            />
          </LabeledWrapper>

          <LabeledWrapper label="Trade Date From">
            <DatePickerAntd
              className=""
              pastDateAllowed={true}
              defaultValue={undefined}
              value={
                filter.tradeDateFrom ? dayjs(filter.tradeDateFrom) : undefined
              }
              onChange={(value, dateString) => {
                setFilter({
                  ...filter,
                  tradeDateFrom: dateString == '' ? undefined : dateString,
                });
              }}
            />
          </LabeledWrapper>

          <LabeledWrapper label="Trade Date To">
            <DatePickerAntd
              className=""
              pastDateAllowed={true}
              value={filter.tradeDateTo ? dayjs(filter.tradeDateTo) : undefined}
              defaultValue={undefined}
              onChange={(value, dateString) => {
                setFilter({
                  ...filter,
                  tradeDateTo: dateString == '' ? undefined : dateString,
                });
              }}
            />
          </LabeledWrapper>
          <div className="flex flex-row items-end">
            <PrimaryButton type="submit" className="">
              Search
            </PrimaryButton>
          </div>
        </form>
      </div>
    </>
  );
}

export default AutoCutHeader;
