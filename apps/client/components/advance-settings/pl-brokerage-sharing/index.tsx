import ScriptHeader from './header';
import PLTable from './pl-table';
import BrokerageTable from './brokerage-table';
import RentTable from './rent-sharing-table';
import useFetch from '@/hooks/useFetch';
import { usePlBrokerageSharingStore } from '@/store/advance-settings/pl-brokerage-sharing';
import Toast from '@/utils/common/toast';
import Routes from '@/utils/routes';
import { PrimaryButton } from '@/components/inputs/button';
import { Layout } from 'antd';
import { H1 } from '@/components/inputs/heading';
import { I } from '@/components/inputs/tooltip';

const Index = () => {
  const { apiCall } = useFetch();

  const { formActive, setFormActive, tableData, setTableData } =
    usePlBrokerageSharingStore();

  const submitHandler = async () => {
    const _toast = new Toast('Updating Records!!!');
    const plShareUpdateData = tableData.plSharing
      .filter((element) => {
        return element.isUpdated;
      })
      .map((element) => {
        let _element = { ...element };
        if (_element.thirdpartyremarks == '') {
          _element.thirdpartyremarks = null;
        }
        if (_element.thirdparty == 0) {
          _element.thirdparty = null;
        }
        // @ts-ignore
        delete _element.isUpdated;
        return _element;
      });
    const brokerageUpdateData = tableData.brokerageSharing
      .filter((element) => {
        return element.isUpdated;
      })
      .map((element) => {
        let _element = { ...element };
        if (_element.thirdpartyremarks == '') {
          _element.thirdpartyremarks = null;
        }
        if (_element.thirdparty == 0) {
          _element.thirdparty = null;
        }
        // @ts-ignore
        delete _element.isUpdated;
        // @ts-ignore
        delete _element.total;
        return _element;
      });
    const [resA, resB] = await Promise.all([
      apiCall(
        Routes.UPDATE_PL_SHARING,
        {
          username: tableData.username,
          updatedSharing: plShareUpdateData,
        },
        false
      ),
      apiCall(
        Routes.UPDATE_USER_BROKERAGE_SHARING,
        {
          username: tableData.username,
          updatedSharing: brokerageUpdateData,
        },
        false
      ),
    ]);
    if (resA.status && resB.status) {
      _toast.success(resA.message);
    } else if (!resA.status) {
      _toast.error(resA.message);
    } else if (!resB.status) {
      _toast.error(resB.message);
    }
  };

  return (
    <Layout className="pt-0 px-[5px] md:px-[24px] pb-[24px] bg-[var(--light-bg)])]">
      <ScriptHeader />
      <div className="mt-1 h-[100%]">
        <div className="my-3 flex items-center space-x-3">
          <H1>PL Sharing</H1>
          {/* <h1 className="text-[var(--dark)] font-bold text-2xl">Search User</h1> */}
          <I text="PL Sharing tooltip" />
        </div>
        <div className="overflow-scroll max-h-[95%]">
          <PLTable />
        </div>
        <div className="my-3 flex items-center space-x-3">
          <H1>Brokerage Sharing</H1>
          {/* <h1 className="text-[var(--dark)] font-bold text-2xl">Search User</h1> */}
          <I text="Brokerage Sharing tooltip" />
        </div>
        <div className="overflow-scroll max-h-[95%]">
          <BrokerageTable />
        </div>

        <div className="my-3 flex items-center space-x-3">
          <H1>Rent Sharing</H1>
          {/* <h1 className="text-[var(--dark)] font-bold text-2xl">Search User</h1> */}
          <I text="Rent Sharing tooltip" />
        </div>
        <div className="overflow-scroll max-h-[95%]">
          <RentTable />
        </div>
        <div className="w-full  flex space-y-2 flex-row sm:flex-row mt-2 justify-between items-center">
          {/* <div className="left text-[var(--primary-shade-b)] underline underline-offset-1">
            {/* Back to Basic Information */}
          {/* </div>  */}
          <div className=""></div>
          <div className="right flex flex-row space-x-2 items-center">
            {formActive == true ? (
              <PrimaryButton
                onClick={() => {
                  setFormActive(false);
                }}
                className="!bg-white text-[var(--primary-shade-b)]"
              >
                Cancel
              </PrimaryButton>
            ) : (
              <PrimaryButton
                onClick={() => {
                  if (
                    tableData.brokerageSharing.length == 0 ||
                    tableData.plSharing.length == 0
                  ) {
                    return;
                  }
                  setFormActive(true);
                }}
                className="!bg-white text-[var(--primary-shade-b)]"
              >
                Edit
              </PrimaryButton>
            )}
            <PrimaryButton onClick={submitHandler}>Save</PrimaryButton>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
