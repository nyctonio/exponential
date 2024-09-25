import React from 'react';
import BasicDetails from './basic-details';
import ExchangeInfo from './exchange-info';
import BrokerageSettings from './brokerage-settings';
import MarginSettings from './margin-settings';
import { useUserCreateStore } from '@/store/create-update-user';
import Navigation from './navigation';
import { useSearchParams } from 'next/navigation';

// type Props = {};

function CreateUserMenu() {
  const searchQuery = useSearchParams();
  const { sectionId, errors, setSectionId, updatedUser } = useUserCreateStore();
  return (
    <div className="flex justify-between mt-[20px] w-full">
      <div className="w-full md:pr-[80px]">
        {sectionId == 1 && <BasicDetails />}
        {sectionId == 2 && <ExchangeInfo />}
        {sectionId == 3 && <BrokerageSettings />}
        {sectionId == 4 && <MarginSettings />}
      </div>
      <div className="hidden space-y-2 md:block">
        <Navigation
          items={[
            {
              id: 1,
              text: 'Basic Details',
              errors: Object.keys(errors.basicDetails).length,
            },
            {
              id: 2,
              text: 'Exchange Settings',
              errors: Object.keys(errors.exchangeSettings).length,
            },
            {
              id: 3,
              text: 'Brokerage Settings',
              errors: Object.keys(errors.brokerageSettings).length,
            },
            {
              id: 4,
              text: 'Margin Settings',
              errors: Object.keys(errors.marginSettings).length,
            },
          ]}
          group="User Details"
          active={sectionId}
          setActive={setSectionId}
        />

        {updatedUser.username && updatedUser.type == 'update' && (
          <Navigation
            items={[
              { id: 5, text: 'Script Quantity' },
              { id: 6, text: 'Trade Margin' },
              { id: 7, text: 'Advance Brokerage' },
              { id: 8, text: 'Auto Cut/Bid/Stop Loss Settings' },
            ]}
            group="Advance Settings"
            active={sectionId}
            setActive={setSectionId}
          />
        )}
      </div>
    </div>
  );
}

export default CreateUserMenu;
