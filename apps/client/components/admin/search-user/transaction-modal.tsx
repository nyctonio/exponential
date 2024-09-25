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

  const [options, setOptions] = useState<{ label: string; value: string }[]>([
    { label: 'Deposit', value: 'Deposit' },
    { label: 'Withdrawal', value: 'Withdrawal' },
  ]);

  const [formData, setFormData] = useState({
    type: 'Deposit',
    remarks: '',
    amount: '',
    password: '',
  });

  const { apiCall } = useFetch();
  const formSubmitHandler = async () => {
    setLoading(true);
    let data = await apiCall(Routes.ADMIN.CREATE_TRANSACTION, {
      userId: modalStatus.userId,
      amount: formData.amount,
      remarks: formData.remarks,
      type: formData.type,
      password: formData.password,
    });
    if (data.status == true) {
      setModalStatus({ ...modalStatus, transaction: false });
      setFormData({ amount: '', password: '', remarks: '', type: 'Deposit' });
      incRefresh();
    }
    setLoading(false);
    return;
  };

  return (
    <Modal
      title={<div className="font-[500] text-xl">Transaction</div>}
      open={modalStatus.transaction}
      className="!w-[85%] md:!w-[60%] lg:!w-[40%] xl:!w-[25%]"
      onOk={() => {}}
      destroyOnClose={true}
      confirmLoading={true}
      centered={true}
      okButtonProps={{ hidden: true }}
      cancelButtonProps={{ hidden: true }}
      onCancel={() => {
        setModalStatus({ ...modalStatus, transaction: false });
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
              Type<span className="text-[#D14343]">*</span>
            </label>
            <SelectAntdBorder
              defaultValue={'Deposit'}
              handleChange={(value) => {
                setFormData({ ...formData, type: value });
              }}
              options={options}
              value={formData.type}
            />
          </div>
          <div className="input flex flex-col space-y-1">
            <label htmlFor="" className="text-[#696F8C] font-[400]">
              Amount<span className="text-[#D14343]">*</span>
            </label>
            <BorderInput
              // className="!border-[1.5px]"
              value={formData.amount}
              onChange={(e) => {
                setFormData({ ...formData, amount: e.target.value });
              }}
              min={1}
              required
              placeholder="Enter Amount"
              type="text"
            />
          </div>
          <div className="input flex flex-col space-y-1">
            <label htmlFor="" className="text-[#696F8C] font-[400]">
              Remarks<span className="text-[#D14343]">*</span>
            </label>
            <BorderInput
              // className="w-full !border-[1.5px]"
              required
              value={formData.remarks}
              onChange={(e) => {
                setFormData({ ...formData, remarks: e.target.value });
              }}
              placeholder="Enter Remarks"
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
              setModalStatus({ ...modalStatus, transaction: false });
            }}
            isCancel={true}
            loading={false}
          />
          <AsyncButtonAntd
            type="submit"
            title="Save"
            isCancel={false}
            loading={loading}
          />
        </div>
      </form>
    </Modal>
  );
}

export default Index;
