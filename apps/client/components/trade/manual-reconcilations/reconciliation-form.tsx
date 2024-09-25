'use client';
import { PrimaryButton } from '@/components/inputs/button';
import { SelectStyled } from '@/components/inputs/select';
import { BorderInput, LabeledWrapper } from '@/components/inputs/text';
import useFetch from '@/hooks/useFetch';
import { useManualReconciliations } from '@/store/trade/manual-reconciliations';
import Toast from '@/utils/common/toast';
import Routes from '@/utils/routes';
import { useEffect, useState } from 'react';

const ReconciliationForm = (props: any) => {
  const { refreshCount, setRefreshCount } = useManualReconciliations();
  const close = props.closeModal;
  const { apiCall } = useFetch();
  const [values, setValues] = useState<{
    actionDate: string;
    instrumentName: string;
    actionType: string;
    actionData: {
      dividend: {
        amount: number;
      } | null;
      bonus: {
        r1: number;
        r2: number;
      } | null;
      split: {
        r1: number;
        r2: number;
      } | null;
    };
  }>({
    actionDate: '',
    instrumentName: '',
    actionType: '',
    actionData: {
      dividend: {
        amount: 0,
      },
      bonus: {
        r1: 0,
        r2: 0,
      },
      split: {
        r1: 0,
        r2: 0,
      },
    },
  });

  const submitHandler = async (e: any) => {
    e.preventDefault();
    const toast = new Toast('Adding Reconciliation');
    let res = await apiCall(
      Routes.TRADE.ADD_RECONCILIATIONS_ACTION,
      values,
      false
    );
    if (res.status) {
      toast.success('Successfully added reconciliation');
      setRefreshCount(refreshCount + 1);
      close();
    } else {
      toast.error(res.message);
    }
  };

  const actionType: { label: string; value: string }[] = [
    { label: 'dividend', value: 'dividend' },
    { label: 'bonus', value: 'bonus' },
    { label: 'split', value: 'split' },
  ];

  useEffect(() => {
    if (values.actionType === 'dividend') {
      setValues({
        ...values,
        actionData: {
          dividend: { amount: 0 },
          bonus: null,
          split: null,
        },
      });
    } else if (values.actionType === 'bonus') {
      setValues({
        ...values,
        actionData: {
          dividend: null,
          bonus: { r1: 0, r2: 0 },
          split: null,
        },
      });
    } else if (values.actionType === 'split') {
      setValues({
        ...values,
        actionData: {
          dividend: null,
          bonus: null,
          split: { r1: 0, r2: 0 },
        },
      });
    }
  }, [values.actionType]);

  return (
    <>
      <form className="grid grid-cols-2 mt-8 gap-5">
        <LabeledWrapper label="Script name" required>
          <BorderInput
            type="text"
            onChange={(e) =>
              setValues({ ...values, instrumentName: e.target.value })
            }
            value={values.instrumentName}
          />
        </LabeledWrapper>
        <LabeledWrapper label="Action Date" required>
          <BorderInput
            type="date"
            onChange={(e) => {
              setValues({ ...values, actionDate: e.target.value });
              console.log(values);
            }}
            value={values.actionDate}
          />
        </LabeledWrapper>

        <LabeledWrapper label="Action Type">
          <SelectStyled
            className="h-[40px] bg-white"
            onChange={(e) => {
              setValues({ ...values, actionType: e.target.value });
            }}
            value={values.actionType}
          >
            <option value={''}>None</option>
            {actionType.map((a) => {
              return (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              );
            })}
          </SelectStyled>
        </LabeledWrapper>

        {values.actionType === 'dividend' && (
          <LabeledWrapper label="Amount" required>
            <BorderInput
              placeholder="Enter Amount"
              type="number"
              onChange={(e) => {
                setValues({
                  ...values,
                  actionData: {
                    ...values.actionData,
                    dividend: {
                      amount: Number(e.target.value),
                    },
                  },
                });
              }}
              value={values.actionData.dividend?.amount}
            />
          </LabeledWrapper>
        )}
        {values.actionType === 'bonus' && (
          <LabeledWrapper label="Bonus" required>
            <div className="flex space-x-3 items-center">
              <BorderInput
                placeholder=""
                type="number"
                className="w-1/2"
                onChange={(e) => {
                  setValues({
                    ...values,
                    actionData: {
                      ...values.actionData,
                      bonus: {
                        r1: Number(e.target.value),
                        r2: values.actionData.bonus?.r2 || 0,
                      },
                    },
                  });
                }}
                value={values.actionData.bonus?.r1}
              />
              <span>:</span>
              <BorderInput
                placeholder=""
                type="number"
                className="w-1/2"
                onChange={(e) => {
                  setValues({
                    ...values,
                    actionData: {
                      ...values.actionData,
                      bonus: {
                        r1: values.actionData.bonus?.r1 || 0,
                        r2: Number(e.target.value),
                      },
                    },
                  });
                }}
                value={values.actionData.bonus?.r2}
              />
            </div>
          </LabeledWrapper>
        )}
        {values.actionType === 'split' && (
          <LabeledWrapper label="Split" required>
            <div className="flex space-x-3 items-center">
              <BorderInput
                placeholder=""
                type="number"
                className="w-1/2"
                onChange={(e) => {
                  setValues({
                    ...values,
                    actionData: {
                      ...values.actionData,
                      split: {
                        r1: Number(e.target.value),
                        r2: values.actionData.bonus?.r2 || 0,
                      },
                    },
                  });
                }}
                value={values.actionData.split?.r1}
              />
              <span>:</span>
              <BorderInput
                placeholder=""
                type="number"
                className="w-1/2"
                onChange={(e) => {
                  setValues({
                    ...values,
                    actionData: {
                      ...values.actionData,
                      split: {
                        r1: values.actionData.bonus?.r1 || 0,
                        r2: Number(e.target.value),
                      },
                    },
                  });
                }}
                value={values.actionData.split?.r2}
              />
            </div>
          </LabeledWrapper>
        )}
      </form>
      <div className="flex justify-end space-x-4 mt-5">
        <PrimaryButton
          onClick={() => {
            setValues({
              instrumentName: '',
              actionType: '',
              actionDate: '',
              actionData: {
                dividend: {
                  amount: 0,
                },
                bonus: {
                  r1: 0,
                  r2: 0,
                },
                split: {
                  r1: 0,
                  r2: 0,
                },
              },
            });
            close();
          }}
        >
          Cancel
        </PrimaryButton>
        <PrimaryButton onClick={submitHandler} type="submit">
          Save
        </PrimaryButton>
      </div>
    </>
  );
};

export default ReconciliationForm;
