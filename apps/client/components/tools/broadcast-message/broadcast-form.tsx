import { AsyncButtonAntd, PrimaryButton } from '@/components/inputs/button';
import { SelectStyled } from '@/components/inputs/select';
import {
  BorderInput,
  LabeledTextbox,
  LabeledWrapper,
  TextInput,
} from '@/components/inputs/text';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';
import { Empty, Select, Spin } from 'antd';
import Joi from 'joi';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useBroadCastStore } from '@/store/tools/broadcastmessage';
import Toast from '@/utils/common/toast';
import { useAdminBroadCastMessage } from '@/store/tools/adminmessage';
import { InlineLabeledToggle } from '@/components/inputs/toggle';
import { useBroadCastMessages } from '@/store/notification/broadcast';

const BroadcastForm = (props: any) => {
  const closeOnSubmit = props.closeOnSubmit;
  const { apiCall } = useFetch();
  const { values, setValues, timeInputs, setTimeInput } = useBroadCastStore();
  const { refreshCount, setRefreshCount } = useAdminBroadCastMessage();
  const {
    refreshCount: messageRefreshCount,
    setRefreshCount: setMessagesRefreshCount,
  } = useBroadCastMessages();
  const [userTypeOptions, setUserTypeOptions] = useState<
    { label: string; value: { id: number; userType: string } }[]
  >([]);
  const [associatedUsers, setAssociatedUsers] = useState<
    {
      label: string;
      value: number;
      userType: string;
    }[]
  >([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [username, setUsername] = useState('');

  const messageTypeOptions: { label: string; value: string }[] = [
    { label: 'Operational', value: 'operational' },
    { label: 'Promotional', value: 'promotion' },
    { label: 'Announcement', value: 'announcement' },
  ];
  const messageFrequencyOptions: { label: string; value: number }[] = [
    { label: '1', value: 1 },
    { label: '2', value: 2 },
    { label: '3', value: 3 },
    { label: '4', value: 4 },
    { label: '5', value: 5 },
    { label: '6', value: 6 },
  ];
  const messageSeverityOptions: { label: string; value: string }[] = [
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
  ];

  const userTypeFetcher = async () => {
    let response = await apiCall(Routes.GET_PROJECT_SETTINGS_BY_KEY, {
      keys: ['USRTYP'],
    });
    if (response.status) {
      console.log(response.data);
      setUserTypeOptions(
        response.data.map((s: any) => ({
          label: s.prjSettConstant,
          value: {
            id: s.id,
            userType: s.prjSettConstant,
          },
        }))
      );
    }
  };

  const associatedUserFetcher = async () => {
    setUserSearchLoading(true);
    let res = await apiCall(
      {
        url: `${Routes.GET_ASSOCIATED_USERS.url}?username=${username}`,
        method: {
          type: 'GET',
          validation: Joi.any(),
        },
      },
      {}
    );
    if (res.status == true) {
      console.log(res.data);
      setAssociatedUsers(
        res.data
          .map((item: any) => {
            return {
              label: item.username,
              value: item.id,
              userType: item.userType,
            };
          })
          .filter((item: any) => {
            if (values.valid_for.userType === 'All') {
              return item;
            } else {
              return item.userType === values.valid_for.userType;
            }
          })
      );
    }
    setUserSearchLoading(false);
    return;
  };

  const filterOption = (
    input: string,
    option: { label: string; value: number }
  ) => {
    console.log(option, input);
    return (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
  };

  const sendBroadCaseMessage = async (e: any) => {
    e.preventDefault();
    const toast = new Toast('Sending Message..');
    if (values.title === '' || values.message === '') {
      toast.error('Please fill all the required fields');
      return;
    }
    if (values.multiple) {
      if (timeInputs.length != values.frequency) {
        toast.error('Please select the time slots');
        return;
      }
      if (values.from_date === '' && values.to_date === '') {
        toast.error('Please select the dates');
        return;
      }
    }
    let res = await apiCall(
      Routes.NOTIFICATION.SAVE_BROADCAST_MESSAGE,
      {
        title: values.title,
        message: values.message,
        type: values.type,
        frequency: values.frequency,
        is_multiple: values.multiple,
        users: values.users,
        from_date: values.from_date,
        to_date: values.to_date,
        severity: values.severity,
        valid_for: values.valid_for.id,
        scheduled_data: timeInputs.map((time) => {
          return {
            time: time,
            executed: false,
          };
        }),
      },
      false
    );
    if (res.status) {
      toast.success('Message sent!');
      setValues({
        title: '',
        message: '',
        type: '',
        from_date: '',
        to_date: '',
        severity: '',
        frequency: 0,
        valid_for: {
          userType: '',
          id: 6,
        },
        users: [],
        multiple: false,
      });
      setTimeInput([]);
      setRefreshCount(refreshCount + 1);
      setMessagesRefreshCount(messageRefreshCount + 1);
      closeOnSubmit();
    } else {
      toast.error('Error sending message');
    }
  };

  const handleTimeInputChange = (index: number, value: string) => {
    const newTimeInputs = [...timeInputs];
    newTimeInputs[index] = value;
    if (index > 0 && value <= newTimeInputs[index - 1]) {
      toast.error('Value must be greater than the previous time input');
      return;
    }
    console.log(newTimeInputs);
    setTimeInput(newTimeInputs);
  };

  useEffect(() => {
    userTypeFetcher();
  }, []);

  useEffect(() => {
    const delayInputTimeoutId = setTimeout(() => {
      associatedUserFetcher();
    }, 1000);
    return () => clearTimeout(delayInputTimeoutId);
  }, [username, values.valid_for]);

  const currentDate = new Date();
  const currentDateTimeString = currentDate.toISOString().slice(0, 10);

  return (
    <div className="flex flex-col space-y-10">
      <div>
        <form
          action=""
          className="grid grid-cols-1  gap-3 w-full  h-[100%] text-[14px] bg-white py-10 px-5 "
          onSubmit={sendBroadCaseMessage}
        >
          <div className="grid grid-cols-2 gap-3">
            <LabeledWrapper label="Message Type">
              <SelectStyled
                className="h-[40px] bg-white"
                onChange={(e) => {
                  setValues({
                    ...values,
                    type: e.target.value,
                  });
                }}
                value={values.type}
              >
                <option value={0}>None</option>
                {messageTypeOptions.map((a) => {
                  return (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  );
                })}
              </SelectStyled>
            </LabeledWrapper>
            <LabeledWrapper label="Message Severity">
              <SelectStyled
                className="h-[40px] bg-white"
                onChange={(e) => {
                  setValues({
                    ...values,
                    severity: e.target.value,
                  });
                }}
                value={values.severity}
              >
                <option value={0}>None</option>
                {messageSeverityOptions.map((a) => {
                  return (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  );
                })}
              </SelectStyled>
            </LabeledWrapper>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <LabeledWrapper label="Title" required={true}>
              <BorderInput
                className="h-10"
                onChange={(e) => {
                  setValues({
                    ...values,
                    title: e.target.value,
                  });
                }}
                value={values.title}
              />
            </LabeledWrapper>
            <LabeledTextbox
              label="Message"
              rows={3}
              cols={10}
              required={true}
              resize={true}
              value={values.message}
              onChange={(e) => {
                setValues({
                  ...values,
                  message: e.target.value,
                });
              }}
            ></LabeledTextbox>
          </div>

          <div className="h-[1px] bg-gray-200"></div>

          <div className="grid grid-cols-2 gap-3">
            <InlineLabeledToggle
              label="Multiple"
              checked={values.multiple}
              onChange={() => {
                setValues({
                  ...values,
                  multiple: !values.multiple,
                  frequency: 0,
                });
                setTimeInput([]);
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <LabeledWrapper label="Active Date From">
              <BorderInput
                type="date"
                onChange={(e) => {
                  setValues({
                    ...values,
                    from_date: e.target.value,
                  });
                }}
                value={values.from_date}
                min={currentDateTimeString}
                disabled={!values.multiple}
              />
            </LabeledWrapper>
            <LabeledWrapper label="Active Date To">
              <BorderInput
                type="date"
                onChange={(e) => {
                  setValues({
                    ...values,
                    to_date: e.target.value,
                  });
                }}
                value={values.to_date}
                min={values.from_date}
                disabled={!values.multiple}
              />
            </LabeledWrapper>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <LabeledWrapper label="Frequency">
              <SelectStyled
                className={`h-[40px] bg-white ${
                  !values.multiple ? 'text-gray-400' : 'text-black'
                }`}
                style={{ borderColor: '#D8DAE5', boxShadow: 'none' }}
                disabled={!values.multiple}
                value={values.frequency}
                onChange={(e) => {
                  setValues({
                    ...values,
                    frequency: Number(e.target.value),
                  });
                }}
              >
                <option value={0}>0</option>
                {messageFrequencyOptions.map((a) => {
                  return (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  );
                })}
              </SelectStyled>
            </LabeledWrapper>
          </div>

          {values.frequency !== 0 && (
            <div className="grid grid-cols-6 gap-3">
              {Array.from({ length: values.frequency }, (_, index) => (
                <BorderInput
                  key={index}
                  type="time"
                  onChange={(event) => {
                    handleTimeInputChange(index, event.target.value);
                  }}
                  value={timeInputs[index]}
                />
              ))}
            </div>
          )}

          <div className="h-[1px] bg-gray-200"></div>

          <div className="grid grid-cols-2 gap-3">
            <LabeledWrapper label="Valid For">
              <SelectStyled
                className="h-[40px] bg-white"
                onChange={(e) => {
                  let selectedValue = JSON.parse(e.target.value);
                  setValues({
                    ...values,
                    valid_for: selectedValue,
                    users: [],
                  });
                }}
                value={JSON.stringify(values.valid_for)}
              >
                <option value={JSON.stringify({ id: 6, userType: 'All' })}>
                  All
                </option>
                {userTypeOptions.map((a) => {
                  return (
                    <option key={a.value.id} value={JSON.stringify(a.value)}>
                      {a.label}
                    </option>
                  );
                })}
              </SelectStyled>
            </LabeledWrapper>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <LabeledWrapper label="Find User">
              <Select
                className={
                  'rounded-[4px] w-full !py-[0.26rem] leading-8 border-[1.2px]  !border-[#D8DAE5] !bg-white !outline-none !shadow-none focus:!border-[var(--primary-shade-c)] active:!border-[var(--primary-shade-c)] focus-within:!border-[var(--primary-shade-c)]'
                }
                size="middle"
                loading={userSearchLoading}
                bordered={false}
                style={{ borderColor: '#D8DAE5', boxShadow: 'none' }}
                placeholder="Select User"
                onChange={(value) => {
                  console.log('change:', value);
                  setValues({ ...values, users: value });
                }}
                // @ts-ignore
                filterOption={filterOption}
                showSearch={true}
                notFoundContent={
                  userSearchLoading == false ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  ) : (
                    <div className="flex flex-row items-center justify-center py-14">
                      <Spin size="small" tip="Searching"></Spin>
                    </div>
                  )
                }
                onSearch={(value) => {
                  setUsername(value);
                  console.log(value);
                }}
                options={associatedUsers}
                value={values.users}
                mode="multiple"
              />
            </LabeledWrapper>
          </div>

          <div className="flex items-center justify-center pt-5">
            <PrimaryButton type="submit" className="h-10 w-10 -mb-10">
              Save
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BroadcastForm;
