import { Modal } from 'antd';
import { useModal } from '@/store/trade/modal';
import { useScripts } from '@/store/script';
import { useUserStore } from '@/store/user';

import { BorderedButton, PrimaryButton } from '@/components/inputs/button';
import { LabeledWrapper, BorderInput } from '@/components/inputs/text';
import { SelectStyled } from '@/components/inputs/select';
import { BuyPrice, ChangePercentage, LotSize, SellPrice } from '../columns';
import { useState, useEffect } from 'react';

import Routes from '@/utils/routes';
import Toast from '@/utils/common/toast';
import useFetch from '@/hooks/useFetch';
import { useConversionRate } from '@/store/conversion-rate/mcxconversionrate';
import { ToggleAntd } from '@/components/inputs/toggle';

const TradeModal = () => {
  const { config, exchange, scriptQty } = useUserStore();
  const { open, script, setOpen } = useModal();
  const [processing, setProcessing] = useState(false);
  const { apiCall } = useFetch();
  const { conversionScripts } = useConversionRate();
  const [trade, setTrade] = useState<{
    quantity: string;
    price: string;
    order_type: string;
    isIntraday: boolean;
  }>({
    quantity: '',
    price: '',
    order_type: 'market',
    isIntraday: false,
  });

  const [quantityAllowed, setQuantityAllowed] = useState<{ quantity: boolean }>(
    { quantity: false }
  );
  const { scripts } = useScripts();

  useEffect(() => {
    if (!open) {
      setTrade({
        quantity: '',
        price: '',
        order_type: 'market',
        isIntraday: false,
      });
    }
  }, [open]);

  // disable enable script
  const _script = scripts.find((s) => s.exchange + ':' + s.symbol == script);
  if (!_script) return null;
  const exch_checks = exchange.find(
    (e) =>
      e.exchangeName == (_script.exchange == 'NFO' ? 'NSE' : _script.exchange)
  );
  const script_checks = scriptQty.find((s) =>
    script.split(':')[1].includes(s.script)
  );
  const color = 'gray-400';
  const disabled_button_class =
    script_checks?.active == false
      ? `bg-${color} hover:border-${color} hover:bg-${color} border-${color} cursor-not-allowed`
      : '';
  // create order
  const createTrade = async (type: 'buy' | 'sell') => {
    if (script_checks?.active == false) {
      return new Toast('Script is not enabled for trading').error(
        'Script is not enabled for trading'
      );
    }
    const qty = Number(trade.quantity);
    if (isNaN(qty) || qty <= 0) {
      return new Toast('Invalid Quantity').error('Invalid Quantity');
    }
    const price = Number(trade.price);
    if ((isNaN(price) || price <= 0) && trade.order_type == 'limit') {
      return new Toast('Invalid Price').error('Invalid Price');
    }
    console.log(qty, price);
    if (quantityAllowed.quantity && qty % _script.lotSize === 0) {
      return new Toast('Please trade in lot').error('Please trade in lot');
    }
    setProcessing(true);
    if (processing) return;
    const _toast = new Toast('Creating Trade Order');
    const data = await apiCall(
      Routes.TRADE.CREATE_TRADE_ORDER,
      {
        type: type == 'buy' ? 'B' : 'S',
        orderType: trade.order_type,
        quantity:
          config.tradeAllowedinQty &&
          quantityAllowed.quantity &&
          exch_checks?.exchangeName == 'NSE'
            ? qty
            : qty * _script.lotSize,
        price,
        script: _script.exchange + ':' + _script.symbol,
        isIntraday: trade.isIntraday,
      },
      false
    );
    if (data.status) {
      _toast.success(data.message);
      setTrade({
        order_type: 'market',
        price: '',
        quantity: '',
        isIntraday: false,
      });
      setOpen(false);
    } else {
      _toast.error(data.message);
    }
    setProcessing(false);
  };

  const bidSettings = config.autoCutSettings.bidStopSettings.find(
    (a) => a.option == 'Bid Activate'
  );

  let outsideHL = bidSettings?.outside;
  let betweenHL = bidSettings?.between;
  let cmp = bidSettings?.cmp;
  let check = conversionScripts!.find(
    (a) => _script.symbol.match(/^[A-Za-z]+/)![0] == a.name
  );

  return (
    <>
      <Modal
        title="Buy / Sell Stocks"
        className=""
        open={open}
        width={450}
        centered={true}
        onCancel={() => setOpen(false)}
        okButtonProps={{ hidden: true }}
        cancelButtonProps={{ hidden: true }}
      >
        <div className="flex mt-4 justify-between items-center">
          <div>
            <div className="text-xs">
              {script.split(':')[0] == 'NFO' ? 'NSE' : script.split(':')[0]}
            </div>
            <div className="font-semibold">{script.split(':')[1]}</div>
          </div>
          <div>
            <div className="text-xs">Buy Price</div>
            <div className="font-semibold text-[var(--trade-green)]">
              <BuyPrice
                buy_price={_script?.buyPrice}
                buy_price_status={_script?.buy_price_status}
                border={true}
              />
            </div>
          </div>
          <div>
            <div className="text-xs">Sell Price</div>
            <div className="font-semibold text-[var(--trade-red)]">
              <SellPrice
                sell_price={_script?.sellPrice}
                sell_price_status={_script?.sell_price_status}
                border={true}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 mt-3 w-full">
          <div className="text-xs flex space-x-2">
            <p className="font-light">Lot Size</p>
            <p className="font-semibold">
              {check ? _script.lotSize / check.value : _script.lotSize}
            </p>
          </div>
          <div className="text-xs flex justify-center space-x-2">
            <p className="font-light">Open</p>
            <p className="font-semibold">{_script.open}</p>
          </div>
          <div className="text-xs flex justify-end space-x-2">
            <p className="font-light">High</p>
            <p className="font-semibold">{_script.high}</p>
          </div>
          <div className="text-xs flex space-x-2">
            <p className="font-light">% Change</p>
            <div className="font-semibold">
              <ChangePercentage change={_script.change} minWidth={false} />
            </div>
          </div>
          <div className="text-xs flex justify-center space-x-2">
            <p className="font-light ">Close</p>
            <p className="font-semibold">{_script.close}</p>
          </div>
          <div className="text-xs flex  justify-end space-x-2">
            <p className="font-light">Low</p>
            <p className="font-semibold">{_script.low}</p>
          </div>
        </div>
        <div className="mt-3 flex  space-x-2 !w-[100%]">
          <div className="min-w-[50%]">
            <LabeledWrapper label="Order Type">
              <SelectStyled
                className="w-full h-[40px] text-black"
                defaultValue={trade.order_type}
                onChange={(v) => {
                  setTrade({
                    ...trade,
                    price: v.target.value == 'limit' ? _script?.ltp : '',
                    order_type: v.target.value,
                  });
                }}
                value={trade.order_type}
              >
                <option key={'limit'} value={'limit'}>
                  Limit
                </option>
                <option key={'market'} value={'market'}>
                  Market
                </option>
              </SelectStyled>
            </LabeledWrapper>
          </div>
          {config.isIntradayAllowed == true && (
            <LabeledWrapper label="Intraday Trade">
              <div className="flex flex-row items-center h-full">
                <ToggleAntd
                  checked={trade.isIntraday}
                  onChange={(checked, value) => {
                    setTrade({ ...trade, isIntraday: checked });
                  }}
                />
              </div>
            </LabeledWrapper>
          )}
          {config.tradeAllowedinQty == true && _script.exchange === 'NFO' && (
            <LabeledWrapper label="Trade in Qty">
              <div className="flex flex-row items-center h-full">
                <ToggleAntd
                  checked={quantityAllowed.quantity}
                  onChange={(checked, value) => {
                    setQuantityAllowed({
                      ...quantityAllowed,
                      quantity: checked,
                    });
                  }}
                />
              </div>
            </LabeledWrapper>
          )}
        </div>
        <div className="flex justify-center gap-x-2 mt-3">
          <div className="w-1/2">
            <LabeledWrapper
              label={`${
                config.tradeAllowedinQty && exch_checks?.exchangeName == 'NSE'
                  ? quantityAllowed.quantity
                    ? 'Quantity'
                    : 'Lots'
                  : 'Lots'
              }`}
            >
              <BorderInput
                type="string"
                onChange={(e) => {
                  let value = e.target.value;
                  if (isNaN(Number(value))) return;
                  setTrade({
                    ...trade,
                    quantity: value,
                  });
                }}
                value={trade.quantity}
                className="h-[40px] w-auto"
              />
            </LabeledWrapper>
            <p className="text-xs mt-1 font-light">
              (Lot Size: {_script.lotSize})
            </p>
          </div>
          <div className="w-1/2">
            <LabeledWrapper label="Trigger Price">
              <BorderInput
                disabled={trade.order_type == 'market'}
                type="string"
                onChange={(e) => {
                  let value = e.target.value;
                  if (isNaN(Number(value))) return;
                  setTrade({
                    ...trade,
                    price: value,
                  });
                }}
                value={trade.price}
                className="h-[40px] w-auto"
              />
            </LabeledWrapper>
            <div className="text-xs mt-1 font-light">
              {/* {outsideHL && betweenHL && ( */}
              <div className="">
                <div className="text-[var(--primary-shade-b)]">
                  (Buy:{' '}
                  {(
                    Number(_script.buyPrice) -
                    Number(_script.buyPrice) / 100
                  ).toFixed(2)}{' '}
                  -{' '}
                  {(
                    Number(_script.buyPrice) +
                    Number(_script.buyPrice) / 100
                  ).toFixed(2)}
                  )
                </div>
                <div className="text-[var(--trade-red)]">
                  (Sell:{' '}
                  {(
                    Number(_script.sellPrice) -
                    Number(_script.sellPrice) / 100
                  ).toFixed(2)}{' '}
                  -{' '}
                  {(
                    Number(_script.sellPrice) +
                    Number(_script.sellPrice) / 100
                  ).toFixed(2)}
                  )
                </div>
              </div>
              {/* )} */}
            </div>
          </div>
        </div>
        <div className="mt-10 justify-between flex space-x-2">
          <div className="w-1/4"></div>
          <div className="flex w-full space-x-2">
            <PrimaryButton
              onClick={() => {
                createTrade('sell');
              }}
              className={`h-[50px]  w-full bg-[var(--trade-red)] border-[var(--trade-red)] hover:bg-[var(--trade-red)] hover:opacity-90 hover:border-[var(--trade-red)] ${disabled_button_class}`}
            >
              Sell
            </PrimaryButton>
            <PrimaryButton
              onClick={() => {
                createTrade('buy');
              }}
              className={`h-[50px] w-full ${disabled_button_class}`}
            >
              Buy
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default TradeModal;
