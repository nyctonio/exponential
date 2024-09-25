import { AsyncButtonAntd, PrimaryButton } from '@/components/inputs/button';
import { SelectStyled } from '@/components/inputs/select';
import {
  BorderInput,
  LabeledTextbox,
  LabeledWrapper,
  TextInput,
} from '@/components/inputs/text';
import useFetch from '@/hooks/useFetch';
import { useSendNotificationStore } from '@/store/tools/sendnotifications';
import Routes from '@/utils/routes';
import { Empty, Select, Spin } from 'antd';
import Joi from 'joi';
import React, { useEffect, useState } from 'react';
import Toast from '@/utils/common/toast';
import toast from 'react-hot-toast';
import { useAdminNotifications } from '@/store/tools/adminnotificationlist';
import useNotification from 'antd/es/notification/useNotification';
import { useNotifications } from '@/store/notification/notification';

const NotificationForm = (props: any) => {
  const closeOnSubmit = props.closeOnSubmit;
  const { apiCall } = useFetch();
  const { values, setValues } = useSendNotificationStore();
  const { refreshCount, setRefreshCount } = useAdminNotifications();
  const {
    refreshCount: notiRefreshCount,
    setRefreshCount: setNotiRefreshCount,
  } = useNotifications();
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [username, setUsername] = useState('');
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
            if (values.userType.userType === 'All') {
              return item;
            } else {
              return item.userType === values.userType.userType;
            }
          })
      );
    }
    setUserSearchLoading(false);
    return;
  };

  const sendNotification = async (event: any) => {
    event.preventDefault();
    const toast = new Toast('Sending Notification..');
    if (!values.title && !values.message) {
      toast.error('Please fill all the required fields');
      return;
    }
    let res = await apiCall(
      Routes.NOTIFICATION.SAVE_NOTIFICATION,
      {
        title: values.title,
        message: values.message,
        is_hierarchy: values.is_hierarchy,
        users: values.users,
        userType: values.userType.id,
      },
      false
    );
    if (res.status) {
      toast.success('Notification sent!');
      setValues({
        is_hierarchy: false,
        message: '',
        title: '',
        users: [],
        userType: {
          userType: '',
          id: 6,
        },
      });
      setRefreshCount(refreshCount + 1);
      setNotiRefreshCount(notiRefreshCount + 1);
      closeOnSubmit();
    } else {
      toast.error('Error in sending notification');
      return;
    }
  };

  const filterOption = (
    input: string,
    option: { label: string; value: number }
  ) => {
    console.log(option, input);
    return (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
  };

  useEffect(() => {
    userTypeFetcher();
  }, []);

  useEffect(() => {
    const delayInputTimeoutId = setTimeout(() => {
      associatedUserFetcher();
    }, 1000);
    return () => clearTimeout(delayInputTimeoutId);
  }, [username, values.userType]);

  return (
    <div className="flex flex-col space-y-10">
      <div>
        <div className="w-full h-2 bg-[var(--primary-shade-b)]"></div>
        <form
          action=""
          className="grid grid-cols-1 gap-5 w-full h-[100%] text-[14px] bg-white py-10 px-5 "
          onSubmit={sendNotification}
        >
          <div className="grid grid-cols-2 gap-5">
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

          <div className="grid grid-cols-2 gap-3">
            <LabeledWrapper label="User Type">
              <SelectStyled
                className="h-[40px] bg-white"
                onChange={(e) => {
                  let selectedValue = JSON.parse(e.target.value);
                  setValues({
                    ...values,
                    userType: selectedValue,
                    users: [],
                  });
                }}
                value={JSON.stringify(values.userType)}
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
            {/* Send to heirarchy */}
            <div className="mt-5 flex items-center space-x-2">
              <input
                type="checkbox"
                name=""
                id="sendtoheirarchy"
                onChange={(e) => {
                  setValues({
                    ...values,
                    is_hierarchy: !values.is_hierarchy,
                  });
                }}
                checked={values.is_hierarchy}
              />
              <label htmlFor="sendtoheirarchy" className="text-[#696F8C]">
                Send to hierarchy
              </label>
            </div>
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

export default NotificationForm;

export type SelectUserAsButtonType = {
  username: string;
  id: number;
  removeFromList: (id: number) => void;
};

export type SelectedUserType = {
  username: string;
  id: number;
  userType: string;
};

export const SelectedUserAsButton: React.FC<SelectUserAsButtonType> = ({
  username,
  id,
  removeFromList,
}) => {
  const handleClick = () => {
    removeFromList(id);
  };
  return (
    <button className="border-[1px] border-gray-300 p-1 space-x-2 text-gray-500">
      <span>{username}</span>{' '}
      <span
        onClick={handleClick}
        className="text-xs rounded-full bg-gray-200  px-1"
      >
        x
      </span>
    </button>
  );
};
