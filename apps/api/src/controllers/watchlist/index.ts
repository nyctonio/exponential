import { NextFunction, Request, Response } from 'express';
import { ResponseType } from '../../constants/common/response-type';
import { models } from 'database/sql/models';
import { UserRequest } from '../../types/common/req';
import printSafe from 'entity/common/printSafe';
import WatchlistService from '../../services/watchlist';
import { AuthConstants } from '../../constants/auth';

class WatchlistController {
  public static async searchScript(req: UserRequest, res: Response) {
    try {
      let scriptData = await WatchlistService.searchInstruments({
        exch: req.query.exch.toString(),
        page: req.query.page.toString(),
        searchText: req.query.searchText.toString(),
      });

      return res.send({
        status: true,
        data: scriptData,
        message: '',
        type: ResponseType.SUCCESS,
      });
    } catch (e) {
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }

  public static async updateFastTrade(req: UserRequest, res: Response) {
    try {
      let { watchlistId, fastTradeActive, fastTradeLotSize } = req.body;
      console.log(req.body, typeof fastTradeActive, typeof fastTradeLotSize);
      if (
        typeof watchlistId !== 'number' ||
        typeof fastTradeActive !== 'boolean' ||
        typeof fastTradeLotSize !== 'number'
      ) {
        return res.send({
          status: false,
          type: ResponseType.ERROR,
          message: 'Invalid data provided',
        });
      }

      await WatchlistService.updateFastTrade({
        watchlistId,
        fastTradeActive,
        fastTradeLotSize,
        userId: req.userData.id,
      });

      return res.send({
        status: true,
        type: ResponseType.SUCCESS,
        message: 'Fast Trade updated successfully',
      });
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async updateWatchlistName(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      let { watchlistId, name } = req.body;

      if (
        !(await WatchlistService.verifyUserWatchlist(
          req.userData.id,
          watchlistId
        ))
      ) {
        return res.send({
          status: false,
          type: ResponseType.ERROR,
          message: AuthConstants.TOKEN_MISUSE,
        });
      }

      await WatchlistService.updateWatchlist({ watchlistId, name });

      return res.send({
        status: true,
        type: ResponseType.SUCCESS,
        data: {},
        message: '',
      });
    } catch (e) {
      printSafe(['error in updated watchlist name ', e]);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async updateWatchlistScripts(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      let { watchlistId, scripts } = req.body;

      if (
        !(await WatchlistService.verifyUserWatchlist(
          req.userData.id,
          watchlistId
        ))
      ) {
        return res.send({
          status: false,
          type: ResponseType.ERROR,
          message: AuthConstants.TOKEN_MISUSE,
        });
      }

      await WatchlistService.updateWatchlist({ watchlistId, scripts });

      return res.send({
        status: true,
        type: ResponseType.SUCCESS,
        message: '',
        data: scripts,
      });
    } catch (e) {
      printSafe(['error in updating watchlist scripts ', e]);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async getWatchlistColumnsData(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let columnsData = await WatchlistService.getColumnsData();
      return res.send({
        status: true,
        type: ResponseType.SUCCESS,
        data: columnsData,
        message: '',
      });
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async updateUserWatchlistColumns(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      let { columns, watchlistId } = req.body;
      if (
        !(await WatchlistService.verifyUserWatchlist(
          req.userData.id,
          watchlistId
        ))
      ) {
        return res.send({
          status: false,
          type: ResponseType.ERROR,
          message: AuthConstants.TOKEN_MISUSE,
        });
      }

      await WatchlistService.updateWatchlist({ watchlistId, columns });

      return res.send({
        status: true,
        type: ResponseType.SUCCESS,
        data: {},
        message: '',
      });
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async getUserWatchlistData(req: UserRequest, res: Response) {
    try {
      let watchlistData = await WatchlistService.getWatchlistData(
        req.userData.id
      );
      return res.send({
        status: true,
        type: ResponseType.SUCCESS,
        message: '',
        data: watchlistData,
      });
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async getUserAllowedExchangeData(
    req: UserRequest,
    res: Response
  ) {
    try {
      let exchangeData = await models.m_exchangesetting.find({
        where: {
          user: {
            id: req.userData.id,
          },
          isExchangeActive: true,
        },
        relations: {
          exchange: true,
        },
        select: {
          exchange: {
            exchangeName: true,
            id: true,
          },
          id: true,
        },
      });

      let parsedExchangeData = exchangeData.map((item) => {
        return item.exchange.exchangeName;
      });

      return res.send({
        status: true,
        data: parsedExchangeData,
        message: '',
        type: ResponseType.SUCCESS,
      });
    } catch (e) {
      return res.send({
        status: false,
        message: e.message,
        type: ResponseType.ERROR,
      });
    }
  }

  public static async getWatchlistExchangeData(
    req: UserRequest,
    res: Response
  ) {
    try {
      let userId = req.userData.id;
      let finalData = await WatchlistService.getInitialWatchlistData(userId);
      console.log('finalData', finalData);
      return res.send({
        status: true,
        type: ResponseType.SUCCESS,
        message: '',
        data: finalData,
      });
    } catch (e) {
      console.log('error in getWatchlistExchangeData', e);
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }

  public static async getMarketIndexData(req: UserRequest, res: Response) {
    try {
      let data = await WatchlistService.getMarketIndexesData();
      return res.send({
        status: true,
        data,
        type: ResponseType.SUCCESS,
        message: '',
      });
    } catch (e) {
      return res.send({
        status: false,
        type: ResponseType.ERROR,
        message: e.message,
      });
    }
  }
}

export default WatchlistController;
