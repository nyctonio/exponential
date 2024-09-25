import express from 'express';
import WatchlistController from '../../controllers/watchlist';
import AuthService from '../../services/auth';
const watchlistRouter = express.Router();

watchlistRouter.get('/', WatchlistController.getUserWatchlistData);

watchlistRouter.get('/search-script', WatchlistController.searchScript);

watchlistRouter.post(
  '/update-watchlist-script',
  WatchlistController.updateWatchlistScripts
);

watchlistRouter.get(
  '/columns-data',
  WatchlistController.getWatchlistColumnsData
);

watchlistRouter.post(
  '/update-watchlist-column',
  WatchlistController.updateUserWatchlistColumns
);

watchlistRouter.post(
  '/update-watchlist-name',
  WatchlistController.updateWatchlistName
);

watchlistRouter.get(
  '/watchlist-exchange-data',
  WatchlistController.getWatchlistExchangeData
);

watchlistRouter.get(
  '/user-allowed-exchange',
  WatchlistController.getUserAllowedExchangeData
);

watchlistRouter.get(
  '/get-market-index-data',
  WatchlistController.getMarketIndexData
);

watchlistRouter.post('/update-fast-trade', WatchlistController.updateFastTrade);

module.exports = watchlistRouter;
