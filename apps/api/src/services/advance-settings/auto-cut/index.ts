import AutoCutSetttings from 'entity/auto-cut-settings';
import ProjectSetting from 'entity/project-settings';
import User from 'entity/user';

class AutoCutService {
  private static async validateAutoCutSettings(data: any) {
    let { bidStopSettings, mcxBidStopSettings, cuttingSettings } = data;
    let projectSetting = new ProjectSetting([
      'USRBIDCMP',
      'USRSTPCMP',
      'USRMCXBID',
      'USRMCXSTOP',
      'USRCUTSETT',
    ]);
    let defaultData = await projectSetting.getProjectSettingByKeys();

    let result = { status: true, msg: '' };

    if (bidStopSettings) {
      let defaultBidCmp = defaultData.find(
        (a) => a.prjSettKey == 'USRBIDCMP'
      ).prjSettConstant;
      let defaultStopCmp = defaultData.find(
        (a) => a.prjSettKey == 'USRSTPCMP'
      ).prjSettConstant;
      bidStopSettings.map(async (item) => {
        // console.log('item.cmp is ', item.cmp);
        if (
          item.option == 'Bid Activate' &&
          item.cmp < parseFloat(defaultBidCmp)
        ) {
          result = { status: false, msg: `Default Cmp is less` };
          return;
        } else if (
          item.option == 'Stop Loss Activate' &&
          item.cmp < parseFloat(defaultStopCmp)
        ) {
          result = { status: false, msg: 'Default Cmp is less' };
          return;
        }
      });
    }

    if (mcxBidStopSettings) {
      mcxBidStopSettings.map((item) => {
        let defaultMcxStop = defaultData.find(
          (a) => a.prjSettKey == 'USRMCXSTOP'
        );
        let defaultMcxBid = defaultData.find(
          (a) => a.prjSettKey == 'USRMCXBID'
        );

        if (item.bidValue < parseFloat(defaultMcxBid.prjSettConstant)) {
          result = { status: false, msg: 'MCX Isse' };
        }
        if (item.stopLossValue < parseFloat(defaultMcxStop.prjSettConstant)) {
          result = { status: false, msg: 'MCX issue' };
        }
      });
    }

    if (cuttingSettings) {
      let defaultCreditBalance = defaultData.find(
        (a) => a.prjSettName == 'Credit Balance'
      );
      let defaultNotification = defaultData.find(
        (a) => a.prjSettName == 'Notification'
      );

      let checkCreditBalance = cuttingSettings.find(
        (a) => a.name == 'Credit Balance'
      );

      let checkNotification = cuttingSettings.find(
        (a) => a.name == 'Notification'
      );

      console.log('default credit balance ', defaultCreditBalance);

      if (
        checkCreditBalance &&
        parseFloat(checkCreditBalance.value) <
          parseFloat(defaultCreditBalance.prjSettConstant)
      ) {
        result = { status: false, msg: 'Credit balance invalid' };
      }

      if (
        checkNotification &&
        parseFloat(checkNotification.value) <
          parseFloat(defaultNotification.prjSettConstant)
      ) {
        result = { status: false, msg: 'notification invalid' };
      }
    }

    return result;
  }

  public static async updateAutoCutSettings(data) {
    let { bidStopSettings, mcxBidStopSettings, cuttingSettings } = data;

    // console.log('data is ', data);
    let ruleChecks = await this.validateAutoCutSettings(data);
    if (ruleChecks.status == false) {
      return {
        status: false,
        message: ruleChecks.msg,
      };
    }
    let autoCutSettings = new AutoCutSetttings(data.userId);
    if (bidStopSettings) {
      await Promise.all(
        bidStopSettings.map(async (item) => {
          console.log('item.cmp is ', item.cmp);
          let updatedSettings = await autoCutSettings.updateBidStopSettings(
            item.id,
            {
              between: item.between,
              cmp: item.cmp,
              outside: item.outside,
            }
          );
        })
      );
    }

    if (mcxBidStopSettings) {
      await Promise.all(
        mcxBidStopSettings.map(async (item) => {
          console.log('on item ', item);
          let updatedMcxSetting =
            await autoCutSettings.updateMcxBidStopSettings(item.id, {
              bidValue: item.bidValue,
              stopLossValue: item.stopLossValue,
            });
        })
      );
    }

    if (cuttingSettings) {
      await Promise.all(
        cuttingSettings.map(async (item) => {
          let updatedSetting = await autoCutSettings.updateCuttingSettings(
            item.id,
            { value: item.value }
          );
        })
      );
    }

    return { status: true };
  }

  public static async getAutoCutSettings(username: string): Promise<{
    status: boolean;
    message?: string;
    data?: any;
  }> {
    let user = new User({ userName: username });
    let userData = await user.getUserData();
    if (!userData) {
      return { status: false, message: 'User Not Found' };
    }
    let autoCut = new AutoCutSetttings(userData.id);
    let data = await autoCut.getAutoCutSettings();

    return { status: true, data: { ...data, userId: userData.id } };
  }
}

export default AutoCutService;
