import { H1 } from '@/components/inputs/heading';
import { SelectAntdBorder, SelectStyled } from '@/components/inputs/select';
import { BorderInput, TextInput } from '@/components/inputs/text';
import useFetch from '@/hooks/useFetch';
import { useManageTradeStatus } from '@/store/trade/managetradestatus';
import Routes from '@/utils/routes';
import { ClockCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import {
  Calendar,
  Modal,
  TimePicker,
  Typography,
  DatePicker,
  Select,
  Empty,
  Spin,
} from 'antd';
const { Paragraph, Text } = Typography;
import dayjs, { Dayjs } from 'dayjs';
import moment from 'moment';
import { useEffect } from 'react';
import Search from '../perform-trades/search';
import { SwitchToggle, ToggleAntd } from '@/components/inputs/toggle';
import { useSearchScripts } from '@/store/script/script-search';
import Toast from '@/utils/common/toast';
const { RangePicker } = DatePicker;

const Index = () => {
  const {
    drawerOpen,
    month: StoreMonth,
    selectedDate,
    setDrawerOpen,
    setMonth,
    setSelectedDate,
    setYear,
    statusData,
    setStatusData,
    year: StoreYear,
    modalData,
    setModalData,
  } = useManageTradeStatus();
  const { apiCall } = useFetch();

  const { selectedScripts, setSelectedScripts } = useSearchScripts();

  const calendarDataFetcher = async () => {
    let monthStartDate = dayjs(
      `${StoreYear}-${
        Number(StoreMonth) + 1 < 10
          ? `0${Number(StoreMonth) + 1}`
          : Number(StoreMonth) + 1
      }-01`,
      { format: 'YYYY-MM-DD' }
    )
      .startOf('day')
      .format('YYYY-MM-DDTHH:mm:ss');

    let monthEndDate = dayjs(
      `${StoreYear}-${
        Number(StoreMonth) + 1 < 10
          ? `0${Number(StoreMonth) + 1}`
          : Number(StoreMonth) + 1
      }-01`,
      { format: 'YYYY-MM-DD' }
    )
      .endOf('month')
      .format('YYYY-MM-DDTHH:mm:ss');

    let res = await apiCall(Routes.TRADE.GET_TRADE_STATUS_BY_MONTH, {
      startDate: monthStartDate,
      endDate: monthEndDate,
    });

    if (res.status) {
      setStatusData(res.data);
    }
    return;
  };

  const saveModalData = async () => {
    if (
      !modalData.endTimeMCX ||
      !modalData.endTimeNSE ||
      !modalData.startTimeMCX ||
      !modalData.startTimeNSE
    ) {
      new Toast('').error('Please fill all the fields');
      return;
    }
    let nseEndHours = dayjs(modalData.endTimeNSE).toDate().getHours();
    let nseStartHours = dayjs(modalData.startTimeNSE).toDate().getHours();
    let mcxEndHours = dayjs(modalData.endTimeMCX).toDate().getHours();
    let mcxStartHours = dayjs(modalData.startTimeMCX).toDate().getHours();

    if (dayjs(selectedDate).diff(dayjs(), 'day') < 0) {
      new Toast('').error('Please select a valid date');
      return;
    }

    if (nseStartHours! > nseEndHours!) {
      new Toast('').error('Start time should be less than end time for NSE');
      return;
    }

    if (mcxStartHours! > mcxEndHours!) {
      new Toast('').error('Start time should be less than end time for MCX');
      return;
    }

    setModalData({ ...modalData, loading: true });
    let res = await apiCall(Routes.TRADE.UPDATE_TRADE_STATUS, {
      date: dayjs(selectedDate).toDate(),
      startTimeNSE: dayjs(selectedDate)
        .set('hour', dayjs(modalData.startTimeNSE).get('hours'))
        .set('minutes', dayjs(modalData.startTimeNSE).get('minutes'))
        .toDate(),
      endTimeNSE: dayjs(selectedDate)
        .set('hour', dayjs(modalData.endTimeNSE).get('hours'))
        .set('minutes', dayjs(modalData.endTimeNSE).get('minutes'))
        .toDate(),
      startTimeMCX: dayjs(selectedDate)
        .set('hour', dayjs(modalData.startTimeMCX).get('hours'))
        .set('minutes', dayjs(modalData.startTimeMCX).get('minutes'))
        .toDate(),
      endTimeMCX: dayjs(selectedDate)
        .set('hour', dayjs(modalData.endTimeMCX).get('hours'))
        .set('minutes', dayjs(modalData.endTimeMCX).get('minutes'))
        .toDate(),
      tradeActiveNSE: modalData.tradeActiveNSE,
      tradeActiveMCX: modalData.tradeActiveMCX,
      disabledInstruments: selectedScripts,
    });

    if (res.status == true) {
      setModalData({
        ...modalData,
        loading: false,
        endTimeMCX: undefined,
        endTimeNSE: undefined,
        startTimeMCX: undefined,
        startTimeNSE: undefined,
        tradeActiveMCX: true,
        tradeActiveNSE: true,
      });
      setSelectedScripts([]);
      setDrawerOpen(false);
      calendarDataFetcher();
      setSelectedDate(undefined);
    } else {
      setModalData({ ...modalData, loading: false });
    }
    return;
  };

  useEffect(() => {
    if (StoreMonth && StoreYear) {
      calendarDataFetcher();
    }
  }, [StoreMonth, StoreYear]);

  //   let selectedDateData =
  let selectedDateData = statusData.find(
    (a) =>
      moment(a.date, 'YYYY-MM-DDTHH:mm:ss')
        .add('+05:30')
        .format('YYYY-MM-DD') ==
      dayjs(selectedDate, { utc: true }).startOf('day').format('YYYY-MM-DD')
  );

  useEffect(() => {
    if (selectedDateData) {
      setModalData({
        ...modalData,
        endTimeMCX: selectedDateData.endTimeMCX,
        endTimeNSE: selectedDateData.endTimeNSE,
        startTimeMCX: selectedDateData.startTimeMCX,
        startTimeNSE: selectedDateData.startTimeNSE,
        tradeActiveMCX: selectedDateData.tradeActiveMCX,
        tradeActiveNSE: selectedDateData.tradeActiveNSE,
      });
    }
  }, [selectedDate]);

  console.log('selected date data is ', selectedDateData);
  return (
    <>
      <div className="w-full h-full px-4 !rounded-xl">
        <Calendar
          mode="month"
          onSelect={(date) => {
            setSelectedDate(date.toString());
            setDrawerOpen(true);
          }}
          value={dayjs(selectedDate)}
          headerRender={({ value, type, onChange, onTypeChange }) => {
            console.log('value is ', value);
            value = dayjs(value);
            const start = 0;
            const end = 12;
            const monthOptions: any = [];

            let current = value.clone();
            //@ts-ignore
            const localeData = value.localeData();
            const months = [];
            for (let i = 0; i < 12; i++) {
              current = current.month(i);
              months.push(localeData.monthsShort(current));
            }

            for (let i = start; i < end; i++) {
              monthOptions.push({ label: months[i], value: i.toString() });
            }

            const year = value.year();
            const month = value.month();
            const options: any = [];
            for (let i = year - 2; i < year + 2; i += 1) {
              options.push({ label: i, value: i.toString() });
            }

            console.log('month options are ', monthOptions);

            if (!StoreYear) {
              setYear(year.toString());
            }

            if (!StoreMonth) {
              setMonth(month.toString());
            }

            return (
              <>
                <div
                  style={{ padding: 8 }}
                  className="flex md:flex-row flex-col space-y-2 md:space-y-0 justify-between !py-8 !px-4 text-center items-center"
                >
                  <H1 className="text-black md:flex hidden">Trade Calendar</H1>
                  <div className="flex flex-row justify-center items-center space-x-1 md:space-x-2">
                    <SelectAntdBorder
                      defaultValue={year.toString()}
                      className="my-year-select"
                      value={StoreYear!}
                      handleChange={(newYear: any) => {
                        const now = value.clone().year(newYear);
                        onChange(now);
                        setYear(newYear.toString());
                      }}
                      options={options}
                    />
                    <SelectAntdBorder
                      value={StoreMonth!}
                      handleChange={(newMonth: any) => {
                        const now = value.clone().month(newMonth);
                        console.log('month is ', newMonth, ' year is ', year);
                        onChange(now);
                        setMonth(newMonth.toString());
                      }}
                      defaultValue={StoreMonth!}
                      placeholder={'Select Month'}
                      options={monthOptions}
                    />
                  </div>
                </div>
              </>
            );
          }}
          onChange={(date) => {
            console.log(
              'date is ',
              date.startOf('day').format('YYYY-MM-DDTHH:mm:ssZ[Z]')
            );
          }}
          cellRender={(date) => {
            let checkDay = statusData.find(
              (a) =>
                moment(a.date, 'YYYY-MM-DDTHH:mm:ss')
                  .add('+05:30')
                  .format('YYYY-MM-DD') ==
                dayjs(date, { utc: true }).startOf('day').format('YYYY-MM-DD')
            );

            if (checkDay) {
              return (
                <div className="flex flex-col space-y-[0.1rem] pt-1">
                  <div>
                    <div className="heading flex flex-row space-x-1 items-center">
                      <div
                        className={`dot h-2 w-2 rounded-full ${
                          checkDay.tradeActiveNSE
                            ? 'bg-[var(--trade-green)]'
                            : 'bg-[var(--trade-red)]'
                        }`}
                      ></div>
                      <div>NSE</div>
                    </div>

                    <div className="time flex flex-row items-center space-x-1 text-xs">
                      <ClockCircleOutlined />
                      <div>
                        {moment(checkDay.startTimeNSE).format('h:mm A')} -
                        {moment(checkDay.endTimeNSE).format('h:mm A')}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="heading flex flex-row space-x-1 items-center">
                      <div
                        className={`dot h-2 w-2 rounded-full ${
                          checkDay.tradeActiveMCX
                            ? 'bg-[var(--trade-green)]'
                            : 'bg-[var(--trade-red)]'
                        }`}
                      ></div>
                      <div>MCX</div>
                    </div>

                    <div className="time flex flex-row items-center space-x-1 text-xs">
                      <ClockCircleOutlined />
                      <div>
                        {moment(checkDay.startTimeMCX).format('h:mm A')} -
                        {moment(checkDay.endTimeMCX).format('h:mm A')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          }}
        />
        {selectedDate && (
          <Modal
            title={
              <div className="font-[500] text-base">
                Update Trade Status for{' '}
                {moment(selectedDate).utcOffset('+05:30').format('YYYY-MM-DD')}
              </div>
            }
            open={drawerOpen}
            className="!w-[85%] md:!w-[60%] lg:!w-[40%] xl:!w-[25%]"
            onOk={() => {
              saveModalData();
            }}
            okButtonProps={{
              style: {
                color: 'white',
                backgroundColor: 'var(--primary-shade-b)',
              },
              loading: modalData.loading,
            }}
            confirmLoading={true}
            centered={true}
            onCancel={() => {
              setDrawerOpen(false);
            }}
          >
            <div className="form w-full flex flex-col space-y-2 py-2">
              <div className="flex flex-row justify-between">
                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    NSE Trade
                  </label>
                  <div>
                    <ToggleAntd
                      checked={modalData.tradeActiveNSE}
                      onChange={(value) => {
                        setModalData({ ...modalData, tradeActiveNSE: value });
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    MCX Trade
                  </label>
                  <div>
                    <ToggleAntd
                      checked={modalData.tradeActiveMCX}
                      onChange={(value) => {
                        setModalData({ ...modalData, tradeActiveMCX: value });
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-row justify-between space-x-2">
                <div className="w-full ">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    NSE Start Time
                  </label>

                  <TimePicker
                    bordered={true}
                    showSecond={false}
                    //   value={''}
                    value={
                      modalData.startTimeNSE && dayjs(modalData.startTimeNSE)
                    }
                    onChange={(value) => {
                      console.log('value changed for nse start time ', value);
                      setModalData({
                        ...modalData,
                        startTimeNSE: value?.toDate(),
                      });
                    }}
                    style={{}}
                    className=" rounded-[4px] leading-8 !w-full border-[1.2px] !border-[#D8DAE5] !outline-none !shadow-none focus:!border-[var(--primary-shade-c)] active:!border-[var(--primary-shade-c)] focus-within:!border-[var(--primary-shade-c)] !pl-3"
                  />
                </div>

                <div className="w-full ">
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    NSE End Time
                  </label>

                  <TimePicker
                    bordered={true}
                    showSecond={false}
                    value={modalData.endTimeNSE && dayjs(modalData.endTimeNSE)}
                    onChange={(value) => {
                      setModalData({
                        ...modalData,
                        endTimeNSE: value?.toDate(),
                      });
                    }}
                    style={{ borderColor: 'black' }}
                    className=" rounded-[4px] leading-8 !w-full border-[1.2px] !border-[#D8DAE5] !outline-none !shadow-none focus:!border-[var(--primary-shade-c)] active:!border-[var(--primary-shade-c)] focus-within:!border-[var(--primary-shade-c)] !pl-3"
                  />
                </div>
              </div>

              <div className="flex flex-row justify-between space-x-2">
                <div className="w-full ">
                  <label className="block mb-2 text-sm font-medium text-gray-900">
                    MCX Start Time
                  </label>

                  <TimePicker
                    bordered={true}
                    showSecond={false}
                    value={
                      modalData.startTimeMCX && dayjs(modalData.startTimeMCX)
                    }
                    onChange={(value) => {
                      setModalData({
                        ...modalData,
                        startTimeMCX: value?.toDate(),
                      });
                    }}
                    style={{ borderColor: 'black' }}
                    className=" rounded-[4px] leading-8 !w-full border-[1.2px] !border-[#D8DAE5] !outline-none !shadow-none focus:!border-[var(--primary-shade-c)] active:!border-[var(--primary-shade-c)] focus-within:!border-[var(--primary-shade-c)] !pl-3"
                  />
                </div>

                <div className="w-full ">
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    MCX End Time
                  </label>

                  <TimePicker
                    bordered={true}
                    showSecond={false}
                    //   value={''}
                    value={modalData.endTimeMCX && dayjs(modalData.endTimeMCX)}
                    onChange={(value) => {
                      setModalData({
                        ...modalData,
                        endTimeMCX: value?.toDate(),
                      });
                    }}
                    style={{ borderColor: 'black' }}
                    className=" rounded-[4px] leading-8 !w-full border-[1.2px] !border-[#D8DAE5] !outline-none !shadow-none focus:!border-[var(--primary-shade-c)] active:!border-[var(--primary-shade-c)] focus-within:!border-[var(--primary-shade-c)] !pl-3"
                  />
                </div>
              </div>

              <div className="w-full ">
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900"
                >
                  Disabled Scripts
                </label>
                <Search
                  tradeModal={true}
                  className={
                    'rounded-[4px] !py-[0.10rem] leading-8 !w-full md:!w-full lg:!w-full border-[1.2px]  !border-[#D8DAE5] !bg-white !outline-none !shadow-none focus:!border-[var(--primary-shade-c)] active:!border-[var(--primary-shade-c)] focus-within:!border-[var(--primary-shade-c)]'
                  }
                />
              </div>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
};

export default Index;
