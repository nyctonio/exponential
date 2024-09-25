import { useBrokerageStore } from '@/store/advance-settings/brokerage-settings';
import { useScriptQuantity } from '@/store/advance-settings/script-quantity-settings';
import { useAutoCutSettingsStore } from '@/store/advance-settings/trade-auto-cut-settings';
import { useTradeMarginStore } from '@/store/advance-settings/trade-margin-settings';
import { useUserCreateStore } from '@/store/create-update-user';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Loading from '@/components/layout/loading';

let NavLink = ({
  id,
  text,
  activeId,
  errors = 0,
  setActiveId,
}: {
  id: number;
  text: string;
  errors?: number;
  activeId: number;
  setActiveId: (state: number) => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(false);
  const path = usePathname();
  const { updatedUser } = useUserCreateStore();
  const { setUsername: setAutoCutUsername } = useAutoCutSettingsStore();
  const { setUsername: setTradeMarginUsername } = useTradeMarginStore();
  const { setUsername: setScriptQuantityUsername } = useScriptQuantity();
  const { setUsername: setBrokerageUsername } = useBrokerageStore();

  const router = useRouter();
  if (loading) {
    return <Loading />;
  }
  return (
    <div className="flex space-x-[30px] items-center">
      <div
        style={{
          transform: activeId != id ? `translateY(${activeId - id}00%)` : '',
          transition: 'transform 0.3s ease-in-out',
        }}
        className={`${
          id == activeId ? 'visible' : 'invisible'
        } w-[5px] -mx-[3.25px] rounded-sm  transition-transform bg-[var(--primary-shade-b)] h-[25px]`}
      ></div>
      <div
        className={`cursor-pointer flex ${
          id == activeId || hover
            ? 'text-[var(--primary-shade-b)]'
            : 'text-[var(--primary-shade-c)] font-light'
        } `}
        onClick={() => {
          console.log('running with id ', id);
          if (id == 1 || id == 2 || id == 3 || id == 4) {
            router.push(`/admin/create-update-client`);
          }
          if (id == 5) {
            setScriptQuantityUsername(updatedUser.username);
            if (path != '/advance-settings/script-quantity-settings') {
              setLoading(true);
            }
            router.push(`/advance-settings/script-quantity-settings?edit=true`);
            // setUserId(updatedUser.id);
          }
          if (id == 7) {
            // state - username -> set
            setBrokerageUsername(updatedUser.username);
            if (path != '/advance-settings/brokerage-settings') {
              setLoading(true);
            }
            router.push(`/advance-settings/brokerage-settings?edit=true`);
          }
          if (id == 6) {
            setTradeMarginUsername(updatedUser.username);
            if (path != '/advance-settings/trade-margin-settings') {
              setLoading(true);
            }
            router.push(`/advance-settings/trade-margin-settings?edit=true`);
          }
          if (id == 8) {
            setAutoCutUsername(updatedUser.username);
            if (path != '/advance-settings/auto-cut-settings') {
              setLoading(true);
            }
            router.push(`/advance-settings/auto-cut-settings?edit=true`);
          }
          setActiveId(id);
        }}
      >
        {text}
        <div
          className={`${
            errors !== 0
              ? 'text-[var(--light)] mt-[4px] ml-[5px] bg-[#D14343] font-bold flex justify-center items-center h-[5px] w-[5px] rounded-full text-[7px] align-top'
              : 'hidden'
          } `}
        ></div>
      </div>
    </div>
  );
};

const Navigation = ({
  items,
  active,
  setActive,
  group,
}: {
  items: { id: number; text: string; errors?: number }[];
  active: number;
  group: string;
  setActive: (state: number) => void;
}) => {
  return (
    <>
      <p className="text-lg mb-2">{group}</p>
      <div className="border-l-[1.5px] w-[250px] border-[var(--primary-shade-c)]">
        {items.map((item) => (
          <NavLink
            key={item.id}
            id={item.id}
            text={item.text}
            errors={item.errors}
            activeId={active}
            setActiveId={setActive}
          />
        ))}
      </div>
    </>
  );
};

export default Navigation;
