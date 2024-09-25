import { AsyncButtonAntd } from '@/components/inputs/button';
import { BorderInput } from '@/components/inputs/text';
import useFetch from '@/hooks/useFetch';
import { userSearchUserStore } from '@/store/admin/searchuser';
import Toast from '@/utils/common/toast';
import Routes from '@/utils/routes';
import { Modal } from 'antd';
import React, { useState } from 'react';

function Index() {
  const { modalStatus, setModalStatus } = userSearchUserStore();
  const { apiCall } = useFetch();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  const passwordUpdateHandler = async () => {
    setLoading(true);
    if (formData.password != formData.confirmPassword) {
      new Toast('').error('Password and Confirm Password not same');
      setLoading(false);
      return;
    }
    let data = await apiCall(Routes.ADMIN.UPDATE_USER_PASSWORD, {
      userId: modalStatus.userId,
      password: formData.password,
    });

    if (data.status == true) {
      setModalStatus({
        userId: -1,
        password: false,
        loginHistory: false,
        updateStatus: false,
        transaction: false,
        penalty: false,
      });
    }
    setLoading(false);
    return;
  };

  return (
    <Modal
      title={<div className="font-[500] text-xl">Change Password</div>}
      open={modalStatus.password}
      className="!w-[85%] md:!w-[60%] lg:!w-[40%] xl:!w-[25%]"
      onOk={() => {}}
      confirmLoading={true}
      centered={true}
      okButtonProps={{ hidden: true }}
      cancelButtonProps={{ hidden: true }}
      onCancel={() => {
        setModalStatus({ ...modalStatus, password: false });
      }}
    >
      <form
        className="flex flex-col space-y-9 mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          passwordUpdateHandler();
        }}
      >
        <div className="form flex flex-col space-y-2 ">
          <div className="input flex flex-col space-y-1">
            <label htmlFor="" className="text-[#696F8C] font-[400]">
              New Password<span className="text-[#D14343]">*</span>
            </label>
            <BorderInput
              // className="w-full !border-[1.5px]"
              placeholder="Enter New Password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
              }}
            />
          </div>
          <div className="input flex flex-col space-y-1">
            <label htmlFor="" className="text-[#696F8C] font-[400]">
              Confirm Password<span className="text-[#D14343]">*</span>
            </label>
            <BorderInput
              // className="!border-[1.5px]"
              placeholder="Enter Confirm Password"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value });
              }}
            />
          </div>
          <div className="input flex flex-row items-center space-x-1 pt-2">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_1_84)">
                <path
                  d="M6.66667 6.66666V5C6.66667 3.15905 8.15905 1.66666 10 1.66666L15 1.66666C16.841 1.66666 18.3333 3.15905 18.3333 5V10C18.3333 11.8409 16.841 13.3333 15 13.3333H13.3333M6.66667 6.66666H5C3.15905 6.66666 1.66667 8.15905 1.66667 10V15C1.66667 16.8409 3.15905 18.3333 5 18.3333H10C11.841 18.3333 13.3333 16.8409 13.3333 15V13.3333M6.66667 6.66666H10C11.841 6.66666 13.3333 8.15905 13.3333 10V13.3333"
                  stroke="#28303F"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_1_84">
                  <rect width="20" height="20" fill="white" />
                </clipPath>
              </defs>
            </svg>
            <div className="text-[] underline underline-offset-2">
              Copy Password
            </div>
          </div>
        </div>

        <div className="buttons flex flex-row space-x-2 justify-end">
          <AsyncButtonAntd
            type="button"
            title="Cancel"
            onClick={() => {
              setModalStatus({ ...modalStatus, password: false });
            }}
            isCancel={true}
            loading={false}
          />
          <AsyncButtonAntd
            type="submit"
            title="Update"
            isCancel={false}
            loading={loading}
          />
        </div>
      </form>
    </Modal>
  );
}

export default Index;
