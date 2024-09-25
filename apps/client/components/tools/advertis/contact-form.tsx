import { AsyncButtonAntd } from '@/components/inputs/button';
import {
  BorderInput,
  LabeledTextbox,
  LabeledWrapper,
} from '@/components/inputs/text';
import useFetch from '@/hooks/useFetch';
import { useContactStore } from '@/store/marketing/contact';
import Toast from '@/utils/common/toast';
import Routes from '@/utils/routes';

import React from 'react';

const Contact: React.FC = () => {
  const { values, setValues } = useContactStore();
  const { apiCall } = useFetch();
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const toast = new Toast('Submitting!');
    const response = await apiCall(Routes.USER.USER_CONTACT, values, false);
    if (response.status) {
      toast.success('Submitted');
      setValues({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      return;
    } else {
      toast.error(response.message);
      return;
    }
  };
  return (
    <div className="bg-white h-full md:h-[26rem]">
      <h2 className="h-9 text-base pl-5 py-1 text-white bg-[var(--primary-shade-b)] flex items-center">
        Send Your Request
      </h2>
      <form
        action=""
        className="grid grid-cols-1 md:grid-cols-2 gap-3  w-full h-[100%] text-[14px] p-5"
        onSubmit={handleSubmit}
      >
        <div>
          <LabeledWrapper label="Name" className="mb-4 md:mb-8" required={true}>
            <BorderInput
              className=""
              placeholder="Enter your name"
              value={values.name}
              onChange={(e) => {
                setValues({
                  ...values,
                  name: e.target.value,
                });
              }}
              required={true}
            />
          </LabeledWrapper>
          <LabeledWrapper label="Phone" className=" md:mb-0" required={true}>
            <BorderInput
              className=""
              placeholder="+1 102 345 6789"
              value={values.phone}
              pattern="[0-9]{10}"
              type="tel"
              onChange={(e) => {
                setValues({
                  ...values,
                  phone: e.target.value,
                });
              }}
              required={true}
            />
          </LabeledWrapper>
        </div>
        <div className="mt-2 md:mt-0">
          <LabeledWrapper
            label="Email"
            className="mb-4 md:mb-8"
            required={true}
          >
            <BorderInput
              className=""
              placeholder="johndoe@gmail.com"
              value={values.email}
              onChange={(e) => {
                setValues({
                  ...values,
                  email: e.target.value,
                });
              }}
              required={true}
            />
          </LabeledWrapper>
          <LabeledWrapper
            label="Subject"
            className="mb-4 md:mb-0"
            required={true}
          >
            <BorderInput
              className=""
              placeholder="Product Demo"
              value={values.subject}
              onChange={(e) => {
                setValues({
                  ...values,
                  subject: e.target.value,
                });
              }}
              required={true}
            />
          </LabeledWrapper>
        </div>

        <div className="space-y-3 ">
          <LabeledTextbox
            label="Message"
            rows={3}
            cols={10}
            required={true}
            value={values.message}
            onChange={(e) => {
              setValues({
                ...values,
                message: e.target.value,
              });
            }}
          />
          <AsyncButtonAntd
            type="submit"
            loading={false}
            isCancel={false}
            title="Send"
            className=" !px-8 h-10 text-base"
          />
        </div>
      </form>
    </div>
  );
};

export default Contact;
