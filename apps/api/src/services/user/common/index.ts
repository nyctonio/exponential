import Menu from 'entity/menu';
import User from 'entity/user';

class UserCommonService {
  public static async getAssociatedUsers(userId: number, username: string) {
    let user = new User({ userId: userId });
    let associatedUsers = await user.getAssociatedUsers(username || '');
    return associatedUsers;
  }

  private static userInfoFormatter(
    data: {
      exchange: { exchangeName: string };
    }[]
  ) {
    let finalData = {};
    data.map((item) => {
      finalData[`${item.exchange.exchangeName}`] = item;
    });
    return finalData;
  }

  public static async getUserCompleteInfo(parsedUserId: number) {
    let user = new User({ userId: parsedUserId });
    let data = await user.getUserCompleteInfo();
    let parentUser = new User({
      userId:
        (data.userData.createdByUser && data.userData.createdByUser.id) || -1,
    });
    // console.log('data is  ===>', data);
    let parentUserData = await parentUser.getUserData({ userType: true });

    let finalData = {
      userData: data.userData,
      creditDetails: {
        transactionAmount: data.userData.openingBalance,
        transactionRemarks: data.userData.openingRemarks,
      },
      exchangeSettings: this.userInfoFormatter(data.exchangeSettings),
      brokerageSettings: this.userInfoFormatter(data.brokerageSettings),
      intradayMarginSettings: this.userInfoFormatter(
        data.intradayMarginSettings
      ),
      tradeMarginSettings: this.userInfoFormatter(data.tradeMarginSettings),
      plShareSettings: {},
      rentData: data.rentData,
    };

    let plShareData = this.userInfoFormatter(data.plShareSettings);

    console.log('pl share data is ', plShareData);
    console.log('parent user data is ', parentUserData);

    if (parentUserData) {
      Object.keys(plShareData).map((key) => {
        switch (parentUserData.userType.prjSettConstant) {
          case 'Company':
            finalData.plShareSettings[`${key}`] =
              plShareData[`${key}`].companySharing;
            break;
          case 'Master':
            finalData.plShareSettings[`${key}`] =
              plShareData[`${key}`].masterSharing;
            break;
          case 'Broker':
            finalData.plShareSettings[`${key}`] =
              plShareData[`${key}`].brokerSharing;
            break;

          case 'Sub-Broker':
            finalData.plShareSettings[`${key}`] =
              plShareData[`${key}`].subbrokerSharing;
            break;
        }
      });
    }
    // console.log('final data is ', finalData);
    return finalData;
  }

  public static async getAllowedExchanges(username: string) {
    let user = new User({ userName: username });
    return await user.getAllowedExchanges();
  }

  public static async getParentId(userId: number) {
    let user = new User({ userId: userId });
    let parent = await user.getParentUser();
    return parent.userId;
  }

  public static async getUserAccessData(username: string) {
    let user = new User({ userName: username });
    let userData = await user.getUserData({ userType: true });
    if (!userData) {
      throw new Error('User Not Found');
    }
    user.userId = userData.id;
    let menu = new Menu(-1);
    let userFunctions = await user.get.getUserAccessData(userData.id);
    let defaultFunctions = await menu.getDefaultFunctionMapping(
      userData.userType.id,
      true
    );
    return { userFunctions, defaultFunctions };
  }

  public static async updateUserAccessData(
    username: string,
    editedFunctions: any
  ) {
    let user = new User({ userName: username });
    let userData = await user.getUserData({ userType: true });
    if (!userData) {
      throw new Error('User Not Found');
    }
    let disabledFunctions = editedFunctions.filter((a) => a.value == false);

    disabledFunctions = disabledFunctions.map((a) => {
      return a.funcId;
    });

    let enabledFunctions = editedFunctions.filter((a) => a.value == true);

    enabledFunctions = enabledFunctions.map((a) => {
      return a.funcId;
    });

    await Promise.all([
      user.update.updateUserAccess(disabledFunctions, false),
      user.update.updateUserAccess(enabledFunctions, true),
    ]);

    return;
  }

  public static async userContact(data: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    userId: number;
  }) {
    let user = new User({ userId: data.userId });
    let res = await user.userContact(data);
    return res;
  }
}

export default UserCommonService;
