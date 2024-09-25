import useFetch from '@/hooks/useFetch';
import { useSearchScripts } from '@/store/script/script-search';
import { useUserStore } from '@/store/user';
import Routes from '@/utils/routes';
import { Empty, Select, Spin } from 'antd';
import { SelectAntdBorder } from '@/components/inputs/select';
import { useEffect, useState } from 'react';
import Toast from '@/utils/common/toast';

const Search = ({
  className = null,
  tradeModal = false,
}: {
  className?: string | null;
  tradeModal?: boolean;
}) => {
  const {
    searchScript,
    setSearchScript,
    setSearchScriptOptions,
    selectedScripts,
    setSelectedScripts,
  } = useSearchScripts();
  const { apiCall } = useFetch();
  const [loading, setLoading] = useState(false);
  const { watchlist } = useUserStore();

  const dataFetcher = async () => {
    setLoading(true);
    let data = await apiCall(
      {
        method: Routes.SEARCH_SCRIPT.method,
        url: `${Routes.SEARCH_SCRIPT.url}?exch=${tradeModal == true ? '' : searchScript.exchange}&searchText=${searchScript.searchValue}&page=1`,
      },
      {}
    );

    if (data.status == true) {
      setSearchScriptOptions(data.data);
    }
    setLoading(false);
    return;
  };

  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchScript({
        exchange: searchScript.exchange,
        searchValue: inputValue,
      });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [inputValue, 300]);

  useEffect(() => {
    dataFetcher();
  }, [searchScript.exchange, searchScript.searchValue]);

  useEffect(() => {
    setSelectedScripts([]);
  }, []);

  return (
    <Select
      mode="multiple"
      className={
        !className
          ? 'rounded-[4px] !py-[0.26rem] leading-8 !w-[180px] md:!w-[210px] lg:!w-[250px] border-[1.2px]  !border-[#D8DAE5] !bg-white !outline-none !shadow-none focus:!border-[var(--primary-shade-c)] active:!border-[var(--primary-shade-c)] focus-within:!border-[var(--primary-shade-c)]'
          : className
      }
      size="middle"
      loading={loading}
      bordered={false}
      maxTagCount={1}
      maxTagTextLength={4}
      style={{ borderColor: '#D8DAE5', boxShadow: 'none' }}
      placeholder="Select Scripts"
      onChange={() => {}}
      value={selectedScripts}
      searchValue={inputValue}
      onSearch={(value) => {
        setInputValue(value);
      }}
      notFoundContent={
        loading == false ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <div className="flex flex-row items-center justify-center py-14">
            <Spin size="small" tip="Searching..."></Spin>
          </div>
        )
      }
      onSelect={(value) => {
        if (
          selectedScripts.length +
            (watchlist.list.find((a) => a.id == watchlist.active)?.keys || [])
              .length +
            1 >=
          21
        ) {
          new Toast('').error("Watchlist can't contain more than 20 scripts");
          return;
        }
        setSelectedScripts([...selectedScripts, value]);
      }}
      onDeselect={(value) => {
        setSelectedScripts(selectedScripts.filter((a) => a != value));
      }}
      options={searchScript.options.map((a) => {
        return {
          label: a.tradingsymbol,
          value: `${a.exchange}:${a.tradingsymbol}`,
          disabled: tradeModal
            ? false
            : watchlist.list
                  .find((c) => c.id == watchlist.active)
                  ?.keys.findIndex(
                    (b) => b == `${a.exchange}:${a.tradingsymbol}`
                  ) != -1
              ? true
              : false,
        };
      })}
    />
  );
};

export default Search;
