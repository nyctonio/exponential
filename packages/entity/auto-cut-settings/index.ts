import {
  m_userbidstopsettings,
  m_usercuttingsettings,
  m_usermcxbidstopsettings,
} from 'database/sql/schema';

class AutoCutSetttings {
  userId: number | number = null;
  constructor(userId: number) {
    this.userId = userId;
  }

  async getAutoCutSettings() {
    let bidStopSettingsPromise = m_userbidstopsettings.find({
      where: { user: { id: this.userId } },
    });
    let mcxBidStopSettingsPromise = m_usermcxbidstopsettings.find({
      where: { user: { id: this.userId } },
      order: {
        instrumentName: 'ASC',
      },
    });
    let cuttingSettingsPromise = m_usercuttingsettings.find({
      where: { user: { id: this.userId } },
      relations: {
        option: true,
      },
      select: {
        option: {
          prjSettConstant: true,
          prjSettDisplayName: true,
          prjSettName: true,
          id: true,
        },
      },
    });

    let [bidStopSettings, mcxBidStopSettings, cuttingSettings] =
      await Promise.all([
        bidStopSettingsPromise,
        mcxBidStopSettingsPromise,
        cuttingSettingsPromise,
      ]);

    return { bidStopSettings, mcxBidStopSettings, cuttingSettings };
  }

  async updateBidStopSettings(id: number, data: any) {
    await m_userbidstopsettings.update({ id: id }, { ...data });
    return;
  }

  async updateCuttingSettings(id: number, data: any) {
    await m_usercuttingsettings.update({ id: id }, { ...data });
    return;
  }

  async updateMcxBidStopSettings(id: number, data: any) {
    let res = await m_usermcxbidstopsettings.update({ id: id }, { ...data });
    console.log('res is ', res, ' for data ', data);
    return;
  }
}

export default AutoCutSetttings;
