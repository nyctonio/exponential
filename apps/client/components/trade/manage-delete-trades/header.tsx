import React, { useEffect, useRef, useState } from 'react';
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
import { useManageTrades } from '@/store/trade/managetrades';
import { useUserStore } from '@/store/user';
import { CSVLink } from 'react-csv';
import Image from 'next/image';

function AutoCutHeader() {
  const { apiCall } = useFetch();
  const { refreshCount, setRefreshCount, filter, setFilter } =
    useManageTrades();
  const [loading, setLoading] = useState(false);
  const [csvData, setCsvData] = useState([]);
  const [downloadInitiated, setDownloadInitiated] = useState(false);
  const downloadRef = useRef(null);
  const [downloadCount, setDownloadCount] = useState(1);

  const CSVDownloadHandler = async () => {
    const toast = new Toast('Downloading trade data');
    setLoading(true);
    setDownloadInitiated(true);
    let res = await apiCall(Routes.TRADE.GET_TRADE_ORDER, {
      username: filter.username,
      script: filter.script,
      exchange: filter.exchange,
      pageNumber: 1,
      pageSize: 1000,
      transactionStatus: 'open,closed',
      tradeDateFrom:
        filter.tradeDateFrom == undefined ? null : filter.tradeDateFrom,
      tradeDateTo: filter.tradeDateTo == undefined ? null : filter.tradeDateTo,
    });

    if (res.status == true) {
      setDownloadCount((count) => count + 1);
      setCsvData(res.data.orders);
      toast.success('Downloaded!');
    } else {
      toast.error('Error while downloading!');
    }
    setLoading(false);
  };

  const { user } = useUserStore();

  useEffect(() => {
    if (csvData.length > 0 && downloadInitiated) {
      console.log('woops! Download');
      //@ts-ignore
      console.log(downloadRef.current.link.click());
    }
  }, [csvData]);
  return (
    <>
      <div className="flex  items-center space-x-2">
        <H1>{user?.userType.constant == 'Client' ? 'My' : 'Manage'} Trades</H1>
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
          {user?.userType.constant !== 'Client' && (
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
              defaultValue={filter.tradeDateFrom}
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
              defaultValue={filter.tradeDateTo}
              onChange={(value, dateString) => {
                setFilter({
                  ...filter,
                  tradeDateTo: dateString == '' ? undefined : dateString,
                });
              }}
            />
          </LabeledWrapper>
          <div className="flex flex-row justify-between items-end">
            <PrimaryButton type="submit" className="max-h-10">
              Search
            </PrimaryButton>
            <div
              className={`flex h-full pt-4 justify-end ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div
                className="cursor-pointer"
                onClick={() => {
                  CSVDownloadHandler();
                }}
              >
                <Image
                  src={'/assets/icons/excelicon.svg'}
                  width={40}
                  height={40}
                  alt="Excel Icon"
                />
              </div>
              <CSVLink
                ref={downloadRef}
                data={csvData}
                filename={`data${downloadCount}.csv`}
              ></CSVLink>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default AutoCutHeader;
