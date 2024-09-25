import Image from 'next/image';
import { useEffect, useState } from 'react';
import { H1 } from '@/components/inputs/heading';
import { I } from '@/components/inputs/tooltip';
import { Empty, Modal, Select, Spin } from 'antd';
import { BorderedButton, PrimaryButton } from '@/components/inputs/button';
import { LabeledWrapper, BorderInput } from '@/components/inputs/text';
import { CloseCircleOutlined } from '@ant-design/icons';
import { useUserCreateStore, defaultUser } from '@/store/create-update-user';
import useFetch from '@/hooks/useFetch';
import useParentFetch from './useParentFetch';
import Routes from '@/utils/routes';
import Joi from 'joi';
import Toast from '@/utils/common/toast';

const CreateUserHeader = () => {
  const {
    mode,
    setMode,
    updatedUser,
    setUpdatedUser,
    resetParent,
    setUser,
    dropdowns,
  } = useUserCreateStore();
  const [username, setUsername] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCreateOnBehalfModalVisible, setIsCreateOnBehalfModalVisible] =
    useState(false);
  const [isCopyModalVisible, setIsCopyModalVisible] = useState(false);
  const [error, setError] = useState('');
  const { apiCall } = useFetch();
  const { fetchData, setUserDetails } = useParentFetch();

  const handleEditClick = () => {
    setIsEditModalVisible(true);
  };

  const handleCreateOnBehalfClick = () => {
    setIsCreateOnBehalfModalVisible(true);
  };

  const handleCopyClick = () => {
    setIsCopyModalVisible(true);
  };

  const handleEditModalOk = () => {
    setIsEditModalVisible(false);
  };

  const handleCreateOnBehalfModalOk = () => {
    setIsCreateOnBehalfModalVisible(false);
  };

  const handleCopyModalOk = () => {
    setIsCopyModalVisible(false);
  };

  const handleModalCancel = () => {
    setIsEditModalVisible(false);
    setIsCreateOnBehalfModalVisible(false);
    setIsCopyModalVisible(false);
  };

  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [associatedUsers, setAssociatedUsers] = useState<
    {
      label: string;
      value: number;
      userType: string;
    }[]
  >([]);

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
        res.data.map((item: any) => {
          return {
            label: item.username,
            value: item.id,
            userType: item.userType,
          };
        })
      );
    }
    setUserSearchLoading(false);
    return;
  };

  useEffect(() => {
    const delayInputTimeoutId = setTimeout(() => {
      associatedUserFetcher();
    }, 1000);
    return () => clearTimeout(delayInputTimeoutId);
  }, [username]);

  const filterOption = (
    input: string,
    option: { label: string; value: number }
  ) => {
    console.log(option, input);
    return (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
  };

  return (
    <div className="flex flex-col space-y-2 md:flex-row items-center justify-between">
      <div className="flex space-x-3 items-center justify-center">
        <H1>Create/Update User</H1>
        <I text="Create User tooltip" />
      </div>

      {updatedUser.username != '' ? (
        <div className="text-[var(--dark)] flex justify-center space-x-2 md:mr-[330px]">
          <span className="text-[var(--primary-shade-b)]">
            {updatedUser.type == 'update'
              ? 'Updating user'
              : updatedUser.type == 'behalf'
                ? 'Creating on behalf'
                : 'Copying user'}
          </span>
          <span className="font-bold  flex justify-center items-center text-[var(--primary-shade-b)]">
            {updatedUser.username}
            <CloseCircleOutlined
              className="pl-2 hover:cursor-pointer"
              onClick={async () => {
                if (
                  updatedUser.type == 'behalf' ||
                  updatedUser.type == 'copy'
                ) {
                  const _toast = new Toast('Resetting');
                  await fetchData();
                  _toast.success('Resetted');
                } else {
                  setUser({
                    ...defaultUser,
                    userType: Number(
                      dropdowns.userTypeOptions.options[0].value
                    ),
                    city: Number(dropdowns.cityOptions.options[0].value),
                    tradeSquareOffLimit: Number(
                      dropdowns.tradeSquareOffLimitOptions.options[0].value
                    ),
                  });
                }
                setUpdatedUser({ username: '', id: -1, type: 'update' });
              }}
            />
          </span>
          <span></span>
        </div>
      ) : (
        <div className="flex justify-center space-x-2 items-center md:mr-[330px]">
          <div
            className="flex cursor-pointer justify-center items-center bg-[var(--light)] md:space-x-2 px-2 py-1 rounded-md"
            onClick={handleEditClick}
          >
            <p className="hidden md:block">Edit</p>
            <Image src="/assets/edit.svg" alt="img" width={18} height={18} />
          </div>
          <div
            className="flex cursor-pointer justify-center items-center bg-[var(--light)] md:space-x-2 px-2 py-1 rounded-md"
            onClick={handleCreateOnBehalfClick}
          >
            <p className="hidden md:block">Create on behalf</p>
            <Image
              src="/assets/user-add.svg"
              alt="img"
              width={18}
              height={18}
            />
          </div>
          <div
            className="flex cursor-pointer justify-center items-center bg-[var(--light)] px-2 py-1 rounded-md"
            onClick={handleCopyClick}
          >
            <Image src="/assets/copy.svg" alt="img" width={20} height={20} />
          </div>
        </div>
      )}

      {/* modals */}
      <Modal
        title="Edit User"
        open={isEditModalVisible}
        onOk={handleEditModalOk}
        okButtonProps={{
          className: 'hidden',
        }}
        cancelButtonProps={{
          className: 'hidden',
        }}
        onCancel={handleModalCancel}
      >
        <div className="flex space-y-4 flex-col">
          <LabeledWrapper label="Username" required>
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
                const _username =
                  associatedUsers.find((item) => item.value === Number(value))
                    ?.label ?? '';
                setUsername(_username);
              }}
              value={username}
              onSearch={(value) => {
                setUsername(value);
                console.log(value);
              }}
              // @ts-ignore
              filterOption={filterOption}
              showSearch={true}
              notFoundContent={
                userSearchLoading == false ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <div className="flex flex-row items-center justify-center py-14">
                    <Spin size="small" tip="Searching..."></Spin>
                  </div>
                )
              }
              options={associatedUsers}
            />
          </LabeledWrapper>
          <div className="flex justify-between">
            <div></div>
            <div className="space-x-2">
              <BorderedButton
                onClick={() => {
                  setIsEditModalVisible(false);
                }}
                className="border-[var(--primary-shade-b)]"
              >
                Cancel
              </BorderedButton>
              <PrimaryButton
                onClick={async () => {
                  const _toast = new Toast('Fetching');
                  const _userid = associatedUsers.find(
                    (item) => item.label === username
                  )?.value;
                  if (!_userid || _userid == -1 || username == '') {
                    new Toast('Please select a user').error(
                      'Please select a user'
                    );
                    return;
                  }

                  const parentUserId = await apiCall(
                    {
                      url: `${Routes.GET_PARENT_USERID.url}?userId=${_userid}`,
                      method: {
                        type: 'GET',
                        validation: Joi.any(),
                      },
                    },
                    {},
                    false
                  );
                  if (parentUserId.status == false) {
                    new Toast(parentUserId.message).error(parentUserId.message);
                    return;
                  }
                  // fetching parent data
                  await fetchData(parentUserId.data, false);
                  // setting user details
                  await setUserDetails(_userid);
                  setUpdatedUser({
                    username: username,
                    id: _userid,
                    type: 'update',
                  });
                  setUsername('');
                  setIsEditModalVisible(false);
                  setMode('update');
                  _toast.success('Fetched');
                }}
              >
                Set
              </PrimaryButton>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        title="Create User on Behalf"
        open={isCreateOnBehalfModalVisible}
        onOk={handleCreateOnBehalfModalOk}
        onCancel={handleModalCancel}
        okButtonProps={{
          className: 'hidden',
        }}
        cancelButtonProps={{
          className: 'hidden',
        }}
      >
        <div className="flex space-y-4 flex-col">
          <LabeledWrapper label="Username" required>
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
                const _username =
                  associatedUsers.find((item) => item.value === Number(value))
                    ?.label ?? '';
                setUsername(_username);
              }}
              value={username}
              onSearch={(value) => {
                setUsername(value);
                console.log(value);
              }}
              // @ts-ignore
              filterOption={filterOption}
              showSearch={true}
              notFoundContent={
                userSearchLoading == false ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <div className="flex flex-row items-center justify-center py-14">
                    <Spin size="small" tip="Searching..."></Spin>
                  </div>
                )
              }
              options={associatedUsers.filter((item) => {
                // for edit user do not allow to select client
                return item.userType != 'Client';
              })}
            />
          </LabeledWrapper>
          <div className="flex justify-between">
            <div></div>
            <div className="space-x-2">
              <BorderedButton
                onClick={() => {
                  setIsCreateOnBehalfModalVisible(false);
                }}
                className="border-[var(--primary-shade-b)]"
              >
                Cancel
              </BorderedButton>
              <PrimaryButton
                onClick={async () => {
                  const _toast = new Toast('Fetching');
                  const _userid = associatedUsers.find(
                    (item) => item.label === username
                  )?.value;
                  if (!_userid || _userid == -1 || username == '') {
                    new Toast('Please select a user').error(
                      'Please select a user'
                    );
                    return;
                  }
                  setUpdatedUser({
                    username: username,
                    id: _userid,
                    type: 'behalf',
                  });
                  // fetching parent data
                  await fetchData(_userid);
                  setUsername('');
                  setIsCreateOnBehalfModalVisible(false);
                  _toast.success('Fetched');
                }}
              >
                Set
              </PrimaryButton>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        title="Copy User"
        open={isCopyModalVisible}
        onOk={handleCopyModalOk}
        onCancel={handleModalCancel}
        okButtonProps={{
          className: 'hidden',
        }}
        cancelButtonProps={{
          className: 'hidden',
        }}
      >
        <div className="flex space-y-4 flex-col">
          <LabeledWrapper label="Username" required>
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
                const _username =
                  associatedUsers.find((item) => item.value === Number(value))
                    ?.label ?? '';
                setUsername(_username);
              }}
              value={username}
              onSearch={(value) => {
                setUsername(value);
                console.log(value);
              }}
              // @ts-ignore
              filterOption={filterOption}
              showSearch={true}
              notFoundContent={
                userSearchLoading == false ? (
                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <div className="flex flex-row items-center justify-center py-14">
                    <Spin size="small" tip="Searching..."></Spin>
                  </div>
                )
              }
              options={associatedUsers.filter((item) => {
                // for edit user do not allow to select client
                return dropdowns.userTypeOptions.options
                  .map((item) => item.constant)
                  .includes(item.userType);
              })}
            />
          </LabeledWrapper>
          <div className="flex justify-between">
            <div></div>
            <div className="space-x-2">
              <BorderedButton
                onClick={() => {
                  setIsCopyModalVisible(false);
                }}
                className="border-[var(--primary-shade-b)]"
              >
                Cancel
              </BorderedButton>
              <PrimaryButton
                onClick={async () => {
                  const _toast = new Toast('Fetching');
                  const _userid = associatedUsers.find(
                    (item) => item.label === username
                  )?.value;
                  if (!_userid || _userid == -1 || username == '') {
                    _toast.error('Please select a user');
                    return;
                  }
                  setUpdatedUser({
                    username: username,
                    id: _userid,
                    type: 'copy',
                  });
                  // setting user details
                  await setUserDetails(_userid, true);
                  setUsername('');
                  setIsCopyModalVisible(false);
                  _toast.success('Fetched');
                }}
              >
                Set
              </PrimaryButton>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreateUserHeader;
