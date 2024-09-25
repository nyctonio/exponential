import { PrimaryButton } from '@/components/inputs/button';
import {
  BorderInput,
  LabeledTextbox,
  LabeledWrapper,
} from '@/components/inputs/text';
import useFetch from '@/hooks/useFetch';
import { useUserManualStore } from '@/store/tools/usermanual';
import Toast from '@/utils/common/toast';
import Routes from '@/utils/routes';
import Joi from 'joi';
import { useState } from 'react';

const ManualForm = () => {
  const { apiCall } = useFetch();
  const { refreshCount, setRefreshCount } = useUserManualStore();
  const [values, setValues] = useState<{
    name: string;
    message: string;
  }>({
    name: '',
    message: '',
  });

  const submitHandler = async (event: any) => {
    event.preventDefault();
    const toast = new Toast("Adding user's manual data");
    let res = await apiCall(
      {
        url: `${Routes.TERMSANDCONDITIONS.ADD_USER_MANUAL.url}?contentType=user_manual`,
        method: {
          type: 'POST',
          validation: Joi.any(),
        },
      },
      {
        name: values.name,
        text: values.message,
        contentType: 'user_manual',
      },
      false
    );
    if (res.status) {
      toast.success('Added successfully');
      setValues({
        name: '',
        message: '',
      });
      setRefreshCount(refreshCount + 1);
    } else {
      toast.error('Error adding user manual');
      return;
    }
  };
  return (
    <div>
      <form
        action=""
        className="grid grid-cols-1 gap-5 w-full h-[100%] text-[14px] bg-white py-10 px-5 "
        onSubmit={submitHandler}
      >
        <LabeledWrapper label="Manual Name" required={true}>
          <BorderInput
            className="h-10"
            onChange={(e) => {
              setValues({ ...values, name: e.target.value });
            }}
            value={values.name}
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
            setValues({ ...values, message: e.target.value });
          }}
        ></LabeledTextbox>
        <PrimaryButton type="submit" className="h-10 w-10 -mb-10">
          Save
        </PrimaryButton>
      </form>
    </div>
  );
};

export default ManualForm;
