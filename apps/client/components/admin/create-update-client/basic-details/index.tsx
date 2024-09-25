import { LabeledWrapper, BorderInput } from '@/components/inputs/text';
import { LabeledToggle } from '@/components/inputs/toggle';
import { H4 } from '@/components/inputs/heading';
import { PrimaryButton } from '@/components/inputs/button';
import { SelectStyled } from '@/components/inputs/select';
import { DatePickerAntd } from '@/components/inputs/date';
import useRules from '../rules';
import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import moment from 'moment';
import useFetch from '@/hooks/useFetch';
import { useUserCreateStore } from '@/store/create-update-user';
import Toast from '@/utils/common/toast';
import Routes from '@/utils/routes';

export const labels = {
  userName: 'userName',
  userType: 'userType',
  firstName: 'firstName',
  lastName: 'lastName',
  password: 'password',
  retypePassword: 'retypePassword',
  email: 'email',
  mobile: 'mobile',
  city: 'city',
  remarks: 'remarks',
  tradeSquareOffLimit: 'tradeSquareOffLimit',
  validTill: 'validTill',
  demoId: 'demoId',
  creditBalance: 'creditBalance',
  creditRemarks: 'creditRemarks',
};

const Page = () => {
  const [firstLoad, setFirstLoad] = useState(true);
  const [isNextClicked, setIsNextClicked] = useState(false);
  const {
    editMode,
    errors,
    setErrors,
    sectionId,
    setSectionId,
    user,
    parent,
    setUser,
    dropdowns,
    updatedUser,
  } = useUserCreateStore();
  const { validate, showHandler, disableHandler } = useRules();
  const [defaultDropdownValue, setDefaultDropdownValue] = useState<any>(() => {
    return {
      userType:
        user.userType != null
          ? dropdowns.userTypeOptions.options.filter((v) => {
              return Number(v.value) == user.userType;
            })[0].label
          : dropdowns.userTypeOptions.options[0].label,
      city:
        user.city != null
          ? dropdowns.cityOptions.options.filter((v) => {
              return Number(v.value) == user.city;
            })[0].label
          : dropdowns.cityOptions.options[0].label,
      tradeSquareOffLimit:
        user.tradeSquareOffLimit != null
          ? dropdowns.tradeSquareOffLimitOptions.options.filter((v) => {
              return Number(v.value) == user.tradeSquareOffLimit;
            })[0].label
          : dropdowns.tradeSquareOffLimitOptions.options[0].label,
    };
  });

  useEffect(() => {
    if (firstLoad) {
      setFirstLoad(false);
      return;
    }
    if (!isNextClicked && editMode) return;

    const _valid = validate();
    if (_valid) {
      // set only those keys which are in labels
      let _error: any = {};
      Object.keys(_valid).forEach((key) => {
        // @ts-ignore
        if (labels[key]) {
          _error[key] = _valid[key];
        }
      });
      setErrors('basicDetails', _error);
    }
  }, [user]);

  useEffect(() => {
    setDefaultDropdownValue({
      userType:
        user.userType != null
          ? dropdowns.userTypeOptions.options.filter((v) => {
              return Number(v.value) == user.userType;
            })[0].label
          : dropdowns.userTypeOptions.options[0].label,
      city: dropdowns.cityOptions.options[0].value,
      tradeSquareOffLimit:
        dropdowns.tradeSquareOffLimitOptions.options[0].value,
    });
    console.log('deff', user.userType, dropdowns, defaultDropdownValue);
  }, [user.userType, user.city, user.tradeSquareOffLimit, dropdowns]);

  let selectedUserType = dropdowns.userTypeOptions.options.find(
    (a) => a.value == user.userType!.toString()
  );

  const errorHandle = (label: string) => {
    let _error = errors.basicDetails ? errors.basicDetails[label] : '';
    return _error;
  };

  const nextHandler = () => {
    const _valid = validate();
    if (_valid) {
      // set only those keys which are in labels
      let _error: any = {};
      Object.keys(_valid).forEach((key) => {
        // @ts-ignore
        if (labels[key]) {
          _error[key] = _valid[key];
        }
      });
      if (Object.keys(_error).length > 0) setErrors('basicDetails', _error);
      else {
        setSectionId(sectionId + 1);
      }
    }
    setIsNextClicked(true);
  };

  const { apiCall } = useFetch();
  const basicDetailsUpdateHandler = async () => {
    let toast = new Toast('Updating Details!!!');
    let res = await apiCall(
      Routes.UPDATE_USER_BASIC_DETAILS,
      {
        userId: updatedUser.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobile,
        city: user.city,
        tradeSquareOffLimit: user.tradeSquareOffLimit,
        validTillDate: user.validTill ? user.validTill : null,
      },
      false
    );

    if (res.status == true) {
      toast.success('Updated Details!!!!');
    } else {
      toast.error(res.message);
    }
    return;
  };

  return (
    <div className="rounded-md py-[15px] w-full bg-[var(--light)] px-[25px] sm:px-[35px]">
      <H4>Client Details</H4>
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-[5%] gap-y-4">
        <LabeledWrapper
          error={errorHandle(labels.userName)}
          label="Username"
          required
        >
          <BorderInput
            onChange={(e) => {
              setUser({ ...user, userName: e.target.value });
            }}
            disabled={disableHandler(labels.userName)}
            value={user.userName}
            placeholder="Enter User Name"
          />
        </LabeledWrapper>
        <LabeledWrapper
          className={showHandler(labels.userType)}
          label="User Type"
          required
        >
          <SelectStyled
            value={String(user.userType)}
            disabled={disableHandler(labels.userType)}
            onChange={(e) => {
              setUser({ ...user, userType: Number(e.target.value) });
              console.log(user);
            }}
          >
            {/* <option label="val" /> */}
            {dropdowns.userTypeOptions.options.map((a) => {
              return (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              );
            })}
          </SelectStyled>
          {/* <SelectAntdBorder
            options={dropdowns.userTypeOptions.options}
            value={String(user.userType)}
            defaultValue={defaultDropdownValue.userType}
            disabled={disableHandler(labels.userType)}
            handleChange={(value) => {
              setUser({ ...user, userType: Number(value) });
            }}
          /> */}
        </LabeledWrapper>
        <LabeledWrapper
          error={errorHandle(labels.firstName)}
          className={showHandler(labels.firstName)}
          label="First Name"
          required
        >
          <BorderInput
            onChange={(e) => {
              setUser({ ...user, firstName: e.target.value });
            }}
            value={user.firstName}
            placeholder="Enter First Name"
          />
        </LabeledWrapper>
        <LabeledWrapper
          className={showHandler(labels.lastName)}
          error={errorHandle(labels.lastName)}
          label="Last Name"
        >
          <BorderInput
            onChange={(e) => {
              setUser({ ...user, lastName: e.target.value });
            }}
            value={user.lastName}
            placeholder="Enter Last Name"
          />
        </LabeledWrapper>
        <LabeledWrapper
          className={showHandler(labels.password)}
          error={errorHandle(labels.password)}
          label="Password"
          required
        >
          <BorderInput
            onChange={(e) => {
              setUser({ ...user, password: e.target.value });
            }}
            value={user.password}
            type="password"
            disabled={disableHandler(labels.password)}
            placeholder="Enter Password"
          />
        </LabeledWrapper>
        <LabeledWrapper
          error={errorHandle(labels.retypePassword)}
          label="Retype Password"
          required
        >
          <BorderInput
            onChange={(e) => {
              setUser({ ...user, retypePassword: e.target.value });
            }}
            value={user.retypePassword}
            disabled={disableHandler(labels.retypePassword)}
            type="password"
            placeholder="Re-Enter Password"
          />
        </LabeledWrapper>
        <LabeledWrapper
          error={errorHandle(labels.email)}
          label="Email"
          required
        >
          <BorderInput
            onChange={(e) => {
              setUser({ ...user, email: e.target.value });
            }}
            value={user.email}
            type="email"
            placeholder="Enter Email"
          />
        </LabeledWrapper>
        <LabeledWrapper
          error={errorHandle(labels.mobile)}
          label="Mobile Number"
          required
        >
          <BorderInput
            onChange={(e) => {
              setUser({ ...user, mobile: e.target.value });
            }}
            value={user.mobile}
            pattern="[0-9]{10}"
            type="tel"
            placeholder="Mobile Number"
          />
        </LabeledWrapper>
        <LabeledWrapper error={errorHandle(labels.city)} label="City" required>
          <SelectStyled
            value={String(user.city)}
            disabled={disableHandler(labels.city)}
            onChange={(e) => {
              setUser({ ...user, city: Number(e.target.value) });
            }}
          >
            {/* <option label="val" /> */}
            {dropdowns.cityOptions.options.map((a) => {
              return (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              );
            })}
          </SelectStyled>
        </LabeledWrapper>
        <LabeledWrapper
          error={errorHandle(labels.remarks)}
          label="Remarks"
          required={true}
        >
          <BorderInput
            onChange={(e) => {
              setUser({ ...user, remarks: e.target.value });
            }}
            disabled={disableHandler(labels.remarks)}
            value={user.remarks}
            placeholder="Enter Remarks"
          />
        </LabeledWrapper>
        <LabeledWrapper
          error={errorHandle(labels.tradeSquareOffLimit)}
          label="Trade Square Off Limit"
          required
        >
          <SelectStyled
            value={String(user.tradeSquareOffLimit)}
            disabled={disableHandler(labels.tradeSquareOffLimit)}
            onChange={(e) => {
              setUser({ ...user, tradeSquareOffLimit: Number(e.target.value) });
            }}
          >
            {/* <option label="val" /> */}
            {dropdowns.tradeSquareOffLimitOptions.options.map((a) => {
              return (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              );
            })}
          </SelectStyled>
        </LabeledWrapper>
        <LabeledWrapper
          error={errorHandle(labels.validTill)}
          label="Valid Till"
        >
          <DatePickerAntd
            onChange={(e) => {
              if (e.$d == null) return;
              let date = moment(e.$d).format('YYYY-MM-DD');
              setUser({ ...user, validTill: date });
            }}
            defaultValue={
              user.validTill == '' || user.validTill == null
                ? ''
                : dayjs(user.validTill)
            }
          />
        </LabeledWrapper>
      </div>
      <div className="mt-5 flex space-x-10">
        <LabeledToggle
          label="Demo ID"
          onChange={(e) => {
            setUser({ ...user, demoId: e });
          }}
          disabled={disableHandler(labels.demoId)}
          checked={user.demoId}
        />
      </div>
      <div className="h-[1.5px] w-full bg-[var(--primary-shade-e)] my-6"></div>
      <H4>Credit Details</H4>
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-x-[5%] gap-y-4">
        <LabeledWrapper
          error={errorHandle(labels.creditBalance)}
          label="Credit Balance"
          required
        >
          <BorderInput
            onChange={(e) => {
              setUser({ ...user, creditBalance: Number(e.target.value) });
            }}
            type="number"
            disabled={disableHandler(labels.creditBalance)}
            value={user.creditBalance ? user.creditBalance : ''}
            placeholder="Enter Balance Credit"
          />
        </LabeledWrapper>
        <LabeledWrapper
          error={errorHandle(labels.creditRemarks)}
          label="Credit Remarks"
          required
        >
          <BorderInput
            onChange={(e) => {
              setUser({ ...user, creditRemarks: e.target.value });
            }}
            disabled={disableHandler(labels.creditRemarks)}
            value={user.creditRemarks}
            placeholder="Enter Credit Remarks"
          />
        </LabeledWrapper>
      </div>
      <div className="h-[1px] w-full bg-[var(--primary-shade-e)] my-6"></div>
      <H4>Users Count</H4>
      <div className="mt-2 grid grid-cols-3 gap-y-4 gap-x-[5%]">
        <LabeledWrapper label="Broker Count">
          <BorderInput
            disabled={
              selectedUserType?.constant == 'Broker' ||
              selectedUserType?.constant == 'Sub-Broker' ||
              selectedUserType?.constant == 'Client'
            }
            onChange={(e) => {
              setUser({ ...user, brokerCount: Number(e.target.value) });
            }}
            value={user.brokerCount!}
            type="number"
          />
        </LabeledWrapper>
        <LabeledWrapper label="Sub-Broker Count">
          <BorderInput
            disabled={
              selectedUserType?.constant == 'Sub-Broker' ||
              selectedUserType?.constant == 'Client'
            }
            onChange={(e) => {
              setUser({ ...user, subBrokerCount: Number(e.target.value) });
            }}
            type="number"
            value={user.subBrokerCount!}
          />
        </LabeledWrapper>
        <LabeledWrapper label="Client Count">
          <BorderInput
            disabled={selectedUserType?.constant == 'Client'}
            onChange={(e) => {
              setUser({ ...user, clientCount: Number(e.target.value) });
            }}
            type="number"
            value={user.clientCount!}
          />
        </LabeledWrapper>
      </div>

      <div className="flex mt-4 md:mt-0 w-full justify-between">
        <div className="hidden md:block"></div>
        <div className="flex space-x-2 w-full md:w-auto">
          <PrimaryButton
            onClick={nextHandler}
            className="mt-4 w-full md:w-auto"
          >
            Next
          </PrimaryButton>
          {updatedUser.username != '' && updatedUser.type == 'update' && (
            <PrimaryButton
              onClick={basicDetailsUpdateHandler}
              className="mt-4 w-full md:w-auto"
            >
              Update
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;
