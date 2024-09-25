import { AsyncButtonAntd } from '@/components/inputs/button';
import {
  SelectAntd,
  SelectAntdBorder,
  SelectStyled,
} from '@/components/inputs/select';
import { ToggleAntd } from '@/components/inputs/toggle';
import { BorderInput } from '@/components/inputs/text';
import useFetch from '@/hooks/useFetch';
import { userSearchUserStore } from '@/store/admin/searchuser';
import Toast from '@/utils/common/toast';
import Routes from '@/utils/routes';
import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';

function Index() {
  const { modalStatus, setModalStatus } = userSearchUserStore();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [options, setOptions] = useState<{ label: string; value: string }[]>(
    []
  );

  const [formData, setFormData] = useState({
    penaltyType: -1,
    hours: 0,
    penalty: 0,
    cutBrokerage: false,
  });

  const { apiCall } = useFetch();
  const formSubmitHandler = async () => {
    setLoading(true);
    console.log('form data is ', formData);
    if (formData.penaltyType == -1) {
      setLoading(false);
      return new Toast('Please Select Penalty Type').error(
        'Please Select Penalty Type'
      );
    }
    const res = await apiCall(
      Routes.USER.SET_PENALTY,
      {
        userId: modalStatus.userId,
        penaltyType: formData.penaltyType,
        hours: formData.hours,
        penalty: formData.penalty,
        cutBrokerage: formData.cutBrokerage,
      },
      false
    );
    if (res.status) {
      new Toast('Penalty Set Successfully').success('Penalty Set Successfully');
      setModalStatus({ ...modalStatus, penalty: false });
    } else {
      new Toast(res.message).error(res.message);
    }
    setLoading(false);
    return;
  };

  const penaltyOptionsFetch = async () => {
    console.log('penalty options fetch called', modalStatus.userId);
    let res = await apiCall(
      Routes.USER.GET_PENALTY,
      {
        userId: modalStatus.userId,
      },
      false
    );
    if (res.status) {
      let options = res.data.penaltyTypes.map((a: any) => ({
        label: a.prjSettDisplayName,
        value: a.id,
      }));
      setOptions(options);
      if (res.data.userPenalty.length > 0) {
        setFormData({
          ...formData,
          penaltyType: res.data.userPenalty[0].penaltyType.id,
          cutBrokerage: res.data.userPenalty[0].cutBrokerage,
          hours: res.data.userPenalty[0].hours,
          penalty: res.data.userPenalty[0].penalty,
        });
      }
    }
    setFetching(false);
    console.log('penalty options are ', res);
  };

  useEffect(() => {
    if (modalStatus.penalty) {
      setFetching(true);
      penaltyOptionsFetch();
    }
  }, [modalStatus.penalty]);

  return (
    <Modal
      title={<div className="font-[500] text-xl">Penalty On Holdings</div>}
      open={modalStatus.penalty}
      className="!w-[85%] md:!w-[60%] lg:!w-[40%] xl:!w-[25%]"
      onOk={() => {}}
      destroyOnClose={true}
      confirmLoading={true}
      centered={true}
      okButtonProps={{ hidden: true }}
      cancelButtonProps={{ hidden: true }}
      onCancel={() => {
        setModalStatus({ ...modalStatus, penalty: false });
      }}
    >
      {fetching ? (
        <div className="flex flex-row justify-center h-[200px] items-center">
          <div className="animate-spin rounded-full h-4 w-4  border-2 border-b-[#1E293B] border-l-[#1E293B] "></div>
        </div>
      ) : (
        <form
          className="flex flex-col space-y-9 mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            formSubmitHandler();
          }}
        >
          <div className="form flex flex-col space-y-2 ">
            <div className="input flex flex-col space-y-1">
              <div className="flex flex-col">
                <label htmlFor="" className="text-[#696F8C] font-[400]">
                  Penalty Type<span className="text-[#D14343]">*</span>
                </label>
                <SelectStyled
                  value={formData.penaltyType}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      penaltyType: Number(e.target.value),
                    });
                  }}
                >
                  <option value={-1}>Select Penalty Type</option>
                  {options.map((a, i) => (
                    <option key={i} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </SelectStyled>
              </div>
              <div className="flex pt-1 w-full justify-between">
                <label htmlFor="" className="text-[#696F8C] font-[400]">
                  Cut Brokerge<span className="text-[#D14343]">*</span>
                </label>
                <ToggleAntd
                  checked={formData.cutBrokerage}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      cutBrokerage: e,
                    });
                  }}
                  // label="Cut Brokerage"
                />
              </div>
            </div>
            <div className="input flex flex-col space-y-1">
              <label htmlFor="" className="text-[#696F8C] font-[400]">
                Hours<span className="text-[#D14343]">*</span>
              </label>
              <BorderInput
                // className="w-full !border-[1.5px]"
                required
                value={formData.hours}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    hours: Number(e.target.value) ? Number(e.target.value) : 0,
                  });
                }}
                placeholder="Penalty After Hours"
                type="text"
              />
            </div>
            <div className="input flex flex-col space-y-1">
              <label htmlFor="" className="text-[#696F8C] font-[400]">
                Penalty<span className="text-[#D14343]">*</span>
              </label>
              <BorderInput
                // className="!border-[1.5px]"
                value={formData.penalty}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    penalty: Number(e.target.value)
                      ? Number(e.target.value)
                      : 0,
                  });
                }}
                required
                placeholder="Enter Penalty Amount"
                type="text"
              />
            </div>
          </div>

          <div className="buttons flex flex-row space-x-2 justify-end">
            <AsyncButtonAntd
              type="button"
              title="Cancel"
              onClick={() => {
                setModalStatus({ ...modalStatus, penalty: false });
              }}
              isCancel={true}
              loading={false}
            />
            <AsyncButtonAntd
              type="submit"
              title="Submit"
              isCancel={false}
              loading={loading}
            />
          </div>
        </form>
      )}
    </Modal>
  );
}

export default Index;
