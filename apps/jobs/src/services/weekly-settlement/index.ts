import ClientSharing from './client-sharing';
import TransferOrder from './transfer-order';
import OpeningBalance from './update-opening-balance';

class WeeklySettlementService {
  public static async runWeeklySettlement() {
    try {
      console.log('running weekly settlement');
      await TransferOrder.transferOrder('NSE');
      await TransferOrder.transferOrder('MCX');
      await ClientSharing.plAndBrokerageShare();
    } catch (e) {
      console.log('error in weekly settlement ', e);
      return;
    }
  }

  public static async updateOpeningBalance() {
    await OpeningBalance.handler();
    return;
  }
}

export default WeeklySettlementService;
