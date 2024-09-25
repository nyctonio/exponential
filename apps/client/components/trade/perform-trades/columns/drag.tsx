import { useScripts } from '@/store/script';
import { useUserStore } from '@/store/user';
import printSafe from '@/utils/common/print';
import Image from 'next/image';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';

const Index = ({ instrumentToken }: { instrumentToken: string }) => {
  const { removeScript } = useScripts();
  const { apiCall } = useFetch();
  const { user, setUser } = useUserStore();
  return (
    <div className="px-2 py-1 text-left">
      <Image
        // onClick={async () => {
        //   removeScript(instrumentToken);
        //   if (user) {
        //     let activeWatchlist = user?.watchlist.find((a) => {
        //       return a.id == user.activeWatchlist;
        //     });

        //     if (activeWatchlist) {
        //       let checkIndex =
        //         activeWatchlist.instrument_tokens.indexOf(instrumentToken);
        //       activeWatchlist.instrument_tokens.splice(checkIndex, 1);
        //       const watchlist = user?.watchlist.map((w) => {
        //         if (w.id == user?.activeWatchlist) {
        //           return {
        //             ...w,
        //             instrument_tokens: activeWatchlist?.instrument_tokens || [],
        //           };
        //         }
        //         return w;
        //       });
        //       // removing script from watchlist
        //       let response = await apiCall(
        //         Routes.UPDATE_WATCHLIST.url,
        //         Routes.UPDATE_WATCHLIST.method,
        //         {
        //           watchlistId: user.activeWatchlist,
        //           scripts: activeWatchlist.instrument_tokens,
        //         }
        //       );
        //       if (response.status == true && watchlist) {
        //         setUser({ ...user, watchlist });
        //       }
        //     }
        //   }
        //   return;
        // }}
        className="cursor-pointer"
        onDrag={(e) => {
          e.screenX = 0;
          e.screenY = 0;
          printSafe([e]);
          e.preventDefault();
        }}
        src="/assets/icons/block.svg"
        alt="delete"
        width={20}
        height={20}
      />
    </div>
  );
};

export default Index;
