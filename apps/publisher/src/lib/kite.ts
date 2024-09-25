import { KiteTicker, KiteConnect } from 'kiteconnect';
import { env } from '../constants';

let ticker = new KiteTicker({
  api_key: env.ZERODHA_API_KEY,
  access_token: 'access_token',
});

ticker.autoReconnect(true, -1, 5);
ticker.connect();

ticker.on('ticks', (ticks) => {
  console.log(ticks);
});

ticker.on('noreconnect', function () {
  console.log('noreconnect');
});

ticker.on('reconnecting', function (reconnect_interval, reconnections) {
  console.log(
    'Reconnecting: attempt - ',
    reconnections,
    ' innterval - ',
    reconnect_interval
  );
});

ticker.on('connect', () => {
  console.log('connected');
  ticker.subscribe([738561, 62949383, 245896]);
  ticker.setMode(ticker.modeFull, [738561, 62949383, 245896]);
});
