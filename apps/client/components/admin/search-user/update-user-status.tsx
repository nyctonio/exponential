import { AsyncButtonAntd } from '@/components/inputs/button';
import { SelectAntd, SelectAntdBorder } from '@/components/inputs/select';
import { BorderInput } from '@/components/inputs/text';
import useFetch from '@/hooks/useFetch';
import { userSearchUserStore } from '@/store/admin/searchuser';
import Routes from '@/utils/routes';
import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';

function Index() {
  const {
    modalStatus,
    setModalStatus,
    constants,
    users,
    incRefresh,
    setUsers,
  } = userSearchUserStore();
  const [loading, setLoading] = useState(false);
  let selectedUser = users.find((a) => a.id == modalStatus.userId);

  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    []
  );

  const [formData, setFormData] = useState({
    status: options.length > 0 ? options[0].value.toString() : '',
    reason: '',
    password: '',
  });

  const { apiCall } = useFetch();
  const formSubmitHandler = async () => {
    setLoading(true);
    console.log('form data is ', formData);
    let data = await apiCall(Routes.ADMIN.UPDATE_USER_STATUS, {
      userId: modalStatus.userId,
      lastStatus: selectedUser?.userStatus.id,
      updatedStatus: parseInt(formData.status),
      remarks: formData.reason,
      password: formData.password,
    });
    if (data.status == true) {
      setModalStatus({ ...modalStatus, updateStatus: false });
      let tempUsers = users;
      let checkIndex = tempUsers.findIndex((a) => a.id == selectedUser?.id);
      tempUsers[checkIndex].userStatus = {
        id: parseInt(formData.status),
        prjSettConstant:
          constants.userStatus.find((a) => a.id == parseInt(formData.status))
            ?.prjSettConstant || '',
        prjSettDisplayName:
          constants.userStatus.find((a) => a.id == parseInt(formData.status))
            ?.prjSettDisplayName || '',
      };
      setUsers(tempUsers);
      incRefresh();
    }
    setLoading(false);
    return;
  };

  useEffect(() => {
    console.log('options are changing ', options);
    if (options.length > 0) {
      setFormData({ ...formData, status: options[0].value });
    }
  }, [options]);

  useEffect(() => {
    let userStatusArray = constants.userStatus;
    console.log(
      'user status array is ',
      userStatusArray,
      'user ',
      selectedUser
    );
    setOptions(
      constants.userStatus
        .filter((a) => a.id != selectedUser?.userStatus.id)
        .map((a) => {
          return { label: a.prjSettDisplayName, value: a.id.toString() };
        })
    );
  }, [constants.userStatus, selectedUser]);

  return (
    <Modal
      title={<div className="font-[500] text-xl">Update Status</div>}
      open={modalStatus.updateStatus}
      className="!w-[85%] md:!w-[60%] lg:!w-[40%] xl:!w-[25%]"
      onOk={() => {}}
      destroyOnClose={true}
      confirmLoading={true}
      centered={true}
      okButtonProps={{ hidden: true }}
      cancelButtonProps={{ hidden: true }}
      onCancel={() => {
        setModalStatus({ ...modalStatus, updateStatus: false });
      }}
    >
      <form
        className="flex flex-col space-y-9 mt-6"
        onSubmit={(e) => {
          e.preventDefault();
          formSubmitHandler();
        }}
      >
        <div className="form flex flex-col space-y-2 ">
          <div className="input flex flex-col space-y-1">
            <label htmlFor="" className="text-[#696F8C] font-[400]">
              Status<span className="text-[#D14343]">*</span>
            </label>
            <SelectAntdBorder
              defaultValue={(options[0] && options[0].value) || ''}
              handleChange={(value) => {
                setFormData({ ...formData, status: value });
              }}
              options={options}
              value={formData.status}
            />
          </div>
          <div className="input flex flex-col space-y-1">
            <label htmlFor="" className="text-[#696F8C] font-[400]">
              Reason<span className="text-[#D14343]">*</span>
            </label>
            <BorderInput
              // className="w-full !border-[1.5px]"
              required
              value={formData.reason}
              onChange={(e) => {
                setFormData({ ...formData, reason: e.target.value });
              }}
              placeholder="Enter Reason"
              type="text"
            />
          </div>
          <div className="input flex flex-col space-y-1">
            <label htmlFor="" className="text-[#696F8C] font-[400]">
              Password<span className="text-[#D14343]">*</span>
            </label>
            <BorderInput
              // className="!border-[1.5px]"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
              }}
              required
              placeholder="Enter Your Password"
              type="password"
            />
          </div>
        </div>

        <div className="buttons flex flex-row space-x-2 justify-end">
          <AsyncButtonAntd
            type="button"
            title="Cancel"
            onClick={() => {
              setModalStatus({ ...modalStatus, updateStatus: false });
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
