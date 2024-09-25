import { AppDataSource } from 'database/sql';
import MarginSettings from 'entity/margin-settings';
import User from 'entity/user';
import Watchlist from 'entity/watchlist';
import { redisClient } from '../../../lib/redis';

export type UpdateMarginInstrument = {
  name: string;
  exchange: string;
  normalMargin: {
    perLot: number;
    perCrore: number;
  } | null;
  intradayMargin: {
    perLot: number;
    perCrore: number;
  } | null;
  marginType: 'lot' | 'crore';
  isMarginTypeUpdated: boolean;
};

export type UpdateMargin = {
  userId: number;
  instruments: UpdateMarginInstrument[];
};

class MarginService {
  public static async getMarginSettings(userId: number) {
    let watchlist = new Watchlist(userId, redisClient);
    let user = new User({ userId });
    let userData = await user.getUserData({
      createdByUser: true,
      userType: true,
    });
    let allowedExchangesName = (
      await user.getAllowedExchanges()
    ).data.exchange.map((a) =>
      a.exchange.exchangeName == 'NSE' ? 'NFO' : a.exchange.exchangeName
    );
    let instruments =
      await watchlist.getMasterInstrumentsGroupedByName(allowedExchangesName);

    let userMargin = new MarginSettings({ userId });
    let uplineMargin = new MarginSettings({
      userId: userData.createdByUser.id,
    });

    let userDefaultMarginData = {
      normalMargin: await userMargin.getTradeMarginSettings(),
      intradayMargin: await userMargin.getIntradayMarginSettings(),
    };

    let uplineDefaultMarginData = {
      normalMargin: await uplineMargin.getTradeMarginSettings(),
      intradayMargin: await uplineMargin.getIntradayMarginSettings(),
    };

    let userScriptMargin = {
      normalMargin: await userMargin.getScriptTradeMarginSettings(),
      intradayMargin: await userMargin.getScriptIntradayTradeMarginSettings(),
    };
    let uplineScriptMargin = {
      normalMargin: await uplineMargin.getScriptTradeMarginSettings(),
      intradayMargin: await uplineMargin.getScriptIntradayTradeMarginSettings(),
    };

    let finalInstruments = [];

    instruments.map((item) => {
      let tempObj = {
        name: item.name,
        exchange: item.exchange,
        userScriptMargin: {
          normalMargin: userScriptMargin.normalMargin.find(
            (a) => a.instrumentName == item.name
          ),
          intradayMargin: userScriptMargin.intradayMargin.find(
            (a) => a.instrumentName == item.name
          ),
        },
        uplineScriptMargin: {
          normalMargin: uplineScriptMargin.normalMargin.find(
            (a) => a.instrumentName == item.name
          ),
          intradayMargin: uplineScriptMargin.intradayMargin.find(
            (a) => a.instrumentName == item.name
          ),
        },
      };
      finalInstruments.push(tempObj);
    });

    return {
      instruments: finalInstruments,
      userDefaultMarginData,
      uplineDefaultMarginData,
      intradayAllowed: userData.isIntradayAllowed,
      userType: userData.userType.prjSettConstant,
    };
  }

  public static async validateIntradayMarginSettings(
    data: UpdateMargin,
    user: User
  ) {
    let userData = await user.getUserData({ createdByUser: true });
    let marginSettings = new MarginSettings({
      userId: userData.createdByUser.id,
    });
    let intradayDefaultMarginSettings =
      await marginSettings.getIntradayMarginSettings();
    let intradayScriptMarginSettings =
      await marginSettings.getScriptIntradayTradeMarginSettings();
    let res = {
      status: true,
      msg: '',
    };

    data.instruments.map((item) => {
      if (
        item.intradayMargin &&
        Object.keys(item.intradayMargin).length != 0 &&
        item.intradayMargin.constructor === Object
      ) {
        console.log('intraaaa');
        let scriptCheck = intradayScriptMarginSettings.find(
          (a) => a.instrumentName == item.name
        );
        if (scriptCheck) {
          if (scriptCheck.marginPerCrore > item.intradayMargin.perCrore) {
            res = {
              status: false,
              msg: `Intraday Margin Per Crore for ${item.name} should be greater than ${scriptCheck.marginPerCrore}`,
            };
          }
          if (scriptCheck.marginPerLot > item.intradayMargin.perLot) {
            res = {
              status: false,
              msg: `Intraday Margin Per Lot for ${item.name} should be greater than ${scriptCheck.marginPerLot}`,
            };
          }
        } else {
          let defaultData = intradayDefaultMarginSettings.find(
            (a) =>
              a.exchange.exchangeName ==
              (item.exchange == 'NFO' ? 'NSE' : item.exchange)
          );
          if (defaultData.marginPerCrore > item.intradayMargin.perCrore) {
            res = {
              status: false,
              msg: `Intraday Margin Per Crore for ${item.name} should be greater than ${defaultData.marginPerCrore}`,
            };
          }
          if (defaultData.marginPerLot > item.intradayMargin.perLot) {
            res = {
              status: false,
              msg: `Intraday Margin Per Lot for ${item.name} should be greater than ${defaultData.marginPerLot}`,
            };
          }
        }
      }
    });

    return res;
  }

  public static async validateNormalMarginSettings(
    data: UpdateMargin,
    user: User
  ) {
    let userData = await user.getUserData({ createdByUser: true });
    let marginSettings = new MarginSettings({
      userId: userData.createdByUser.id,
    });
    let normalDefaultMarginSettings =
      await marginSettings.getTradeMarginSettings();
    let normalScriptMarginSettings =
      await marginSettings.getScriptTradeMarginSettings();
    let res = {
      status: true,
      msg: '',
    };

    data.instruments.map((item) => {
      if (item.normalMargin) {
        let scriptCheck = normalScriptMarginSettings.find(
          (a) => a.instrumentName == item.name
        );
        if (scriptCheck) {
          if (scriptCheck.marginPerCrore > item.normalMargin.perCrore) {
            res = {
              status: false,
              msg: `Normal Margin Per Crore for ${item.name} should be greater than ${scriptCheck.marginPerCrore}`,
            };
          }
          if (scriptCheck.marginPerLot > item.normalMargin.perLot) {
            res = {
              status: false,
              msg: `Normal Margin Per Lot for ${item.name} should be greater than ${scriptCheck.marginPerLot}`,
            };
          }
        } else {
          let defaultData = normalDefaultMarginSettings.find(
            (a) =>
              a.exchange.exchangeName ==
              (item.exchange == 'NFO' ? 'NSE' : item.exchange)
          );

          if (defaultData.marginPerCrore > item.normalMargin.perCrore) {
            res = {
              status: false,
              msg: `Normal Margin Per Crore for ${item.name} should be greater than ${defaultData.marginPerCrore}`,
            };
          }
          if (defaultData.marginPerLot > item.normalMargin.perLot) {
            res = {
              status: false,
              msg: `Normal Margin Per Lot for ${item.name} should be greater than ${defaultData.marginPerLot}`,
            };
          }
        }
      }
    });

    return res;
  }

  public static async instrumentsDataParser(
    data: UpdateMargin,
    user: User,
    currUserId: number
  ) {
    let childUsers = await user.getAllChildUsers();
    let marginSetting = new MarginSettings({ userId: user.userId });
    let childUserIds = childUsers.map((a) => a.id);
    let finalData: {
      intraday: any[];
      normal: any[];
    } = {
      intraday: [],
      normal: [],
    };

    let childUserMarginSettings =
      await marginSetting.getChildUsersMarginSettings(
        childUserIds,
        data.instruments.map((a) => a.name)
      );

    let intraMarginSetting = await marginSetting.getIntradayMarginSettings();

    data.instruments.map((item) => {
      if (item.isMarginTypeUpdated) {
        //adding intraday constraint
        if (intraMarginSetting.length > 0) {
          finalData.intraday.push({
            instrumentName: item.name,
            marginPerCrore: item.intradayMargin.perCrore,
            marginPerLot: item.intradayMargin.perLot,
            marginType: item.marginType,
            createdBy: {
              id: currUserId,
            },
            updatedBy: {
              id: currUserId,
            },
            user: {
              id: data.userId,
            },
          });
        }
        finalData.normal.push({
          instrumentName: item.name,
          marginPerCrore: item.normalMargin.perCrore,
          marginPerLot: item.normalMargin.perLot,
          marginType: item.marginType,
          createdBy: {
            id: currUserId,
          },
          updatedBy: {
            id: currUserId,
          },
          user: {
            id: data.userId,
          },
        });

        childUserIds.map((childId) => {
          let scriptIntradayCheck =
            childUserMarginSettings.scriptIntradayMargin.find(
              (a) => a.user.id == childId && a.instrumentName == item.name
            );

          let defaultIntradayCheck =
            childUserMarginSettings.defaultIntradayMargin.find(
              (a) =>
                a.user.id == childId && a.exchange.exchangeName == item.exchange
            );

          let scriptNormalCheck =
            childUserMarginSettings.scriptNormalMargin.find(
              (a) => a.user.id == childId && a.instrumentName == item.name
            );

          let defaultNormalCheck =
            childUserMarginSettings.defaultNormalMargin.find(
              (a) =>
                a.user.id == childId && a.exchange.exchangeName == item.exchange
            );

          if (scriptIntradayCheck) {
            if (item.intradayMargin.perCrore && item.intradayMargin.perLot) {
              if (
                scriptIntradayCheck.marginPerCrore <
                  item.intradayMargin.perCrore ||
                scriptIntradayCheck.marginPerLot < item.intradayMargin.perLot
              ) {
                finalData.intraday.push({
                  instrumentName: item.name,
                  marginPerCrore: item.intradayMargin.perCrore,
                  marginPerLot: item.intradayMargin.perLot,
                  marginType: item.marginType,
                  createdBy: {
                    id: currUserId,
                  },
                  updatedBy: {
                    id: currUserId,
                  },
                  user: {
                    id: childId,
                  },
                });
              } else {
                finalData.intraday.push({
                  instrumentName: item.name,
                  marginPerCrore: scriptIntradayCheck.marginPerCrore,
                  marginPerLot: scriptIntradayCheck.marginPerLot,
                  marginType: item.marginType,
                  createdBy: {
                    id: currUserId,
                  },
                  updatedBy: {
                    id: currUserId,
                  },
                  user: {
                    id: childId,
                  },
                });
              }
            } else {
              finalData.intraday.push({
                instrumentName: item.name,
                marginPerCrore: scriptIntradayCheck.marginPerCrore,
                marginPerLot: scriptIntradayCheck.marginPerLot,
                marginType: item.marginType,
                createdBy: {
                  id: currUserId,
                },
                updatedBy: {
                  id: currUserId,
                },
                user: {
                  id: childId,
                },
              });
            }
            // }
          } else {
            if (defaultIntradayCheck) {
              if (item.intradayMargin.perCrore && item.intradayMargin.perLot) {
                if (
                  defaultIntradayCheck.marginPerCrore <
                    item.intradayMargin.perCrore ||
                  defaultIntradayCheck.marginPerLot < item.intradayMargin.perLot
                ) {
                  finalData.intraday.push({
                    instrumentName: item.name,
                    marginPerCrore: item.intradayMargin.perCrore,
                    marginPerLot: item.intradayMargin.perLot,
                    marginType: item.marginType,
                    createdBy: {
                      id: currUserId,
                    },
                    updatedBy: {
                      id: currUserId,
                    },
                    user: {
                      id: childId,
                    },
                  });
                } else {
                  finalData.intraday.push({
                    instrumentName: item.name,
                    marginPerCrore: defaultIntradayCheck.marginPerCrore,
                    marginPerLot: defaultIntradayCheck.marginPerLot,
                    marginType: item.marginType,
                    createdBy: {
                      id: currUserId,
                    },
                    updatedBy: {
                      id: currUserId,
                    },
                    user: {
                      id: childId,
                    },
                  });
                }
              } else {
                finalData.intraday.push({
                  instrumentName: item.name,
                  marginPerCrore: defaultIntradayCheck.marginPerCrore,
                  marginPerLot: defaultIntradayCheck.marginPerLot,
                  marginType: item.marginType,
                  createdBy: {
                    id: currUserId,
                  },
                  updatedBy: {
                    id: currUserId,
                  },
                  user: {
                    id: childId,
                  },
                });
              }
            }
          }

          if (scriptNormalCheck) {
            if (
              scriptNormalCheck.marginPerCrore < item.normalMargin.perCrore ||
              scriptNormalCheck.marginPerLot < item.normalMargin.perLot
            ) {
              finalData.normal.push({
                instrumentName: item.name,
                marginPerCrore: item.normalMargin.perCrore,
                marginPerLot: item.normalMargin.perLot,
                marginType: item.marginType,
                createdBy: {
                  id: currUserId,
                },
                updatedBy: {
                  id: currUserId,
                },
                user: {
                  id: childId,
                },
              });
            } else {
              finalData.normal.push({
                instrumentName: item.name,
                marginPerCrore: scriptNormalCheck.marginPerCrore,
                marginPerLot: scriptNormalCheck.marginPerLot,
                marginType: item.marginType,
                createdBy: {
                  id: currUserId,
                },
                updatedBy: {
                  id: currUserId,
                },
                user: {
                  id: childId,
                },
              });
            }
          } else {
            if (defaultNormalCheck) {
              if (
                defaultNormalCheck.marginPerCrore <
                  item.normalMargin.perCrore ||
                defaultNormalCheck.marginPerLot < item.normalMargin.perLot
              ) {
                finalData.normal.push({
                  instrumentName: item.name,
                  marginPerCrore: item.normalMargin.perCrore,
                  marginPerLot: item.normalMargin.perLot,
                  marginType: item.marginType,
                  createdBy: {
                    id: currUserId,
                  },
                  updatedBy: {
                    id: currUserId,
                  },
                  user: {
                    id: childId,
                  },
                });
              } else {
                finalData.normal.push({
                  instrumentName: item.name,
                  marginPerCrore: defaultNormalCheck.marginPerCrore,
                  marginPerLot: defaultNormalCheck.marginPerLot,
                  marginType: item.marginType,
                  createdBy: {
                    id: currUserId,
                  },
                  updatedBy: {
                    id: currUserId,
                  },
                  user: {
                    id: childId,
                  },
                });
              }
            }
          }
        });
      } else {
        if (item.normalMargin) {
          finalData.normal.push({
            instrumentName: item.name,
            marginPerCrore: item.normalMargin.perCrore,
            marginPerLot: item.normalMargin.perLot,
            marginType: item.marginType,
            createdBy: {
              id: currUserId,
            },
            updatedBy: {
              id: currUserId,
            },
            user: {
              id: data.userId,
            },
          });

          childUserIds.map((childId) => {
            let scriptNormalCheck =
              childUserMarginSettings.scriptNormalMargin.find(
                (a) => a.user.id == childId && a.instrumentName == item.name
              );

            let defaultNormalCheck =
              childUserMarginSettings.defaultNormalMargin.find(
                (a) =>
                  a.user.id == childId &&
                  a.exchange.exchangeName == item.exchange
              );

            if (scriptNormalCheck) {
              if (
                scriptNormalCheck.marginPerCrore < item.normalMargin.perCrore ||
                scriptNormalCheck.marginPerLot < item.normalMargin.perLot
              ) {
                finalData.normal.push({
                  instrumentName: item.name,
                  marginPerCrore: item.normalMargin.perCrore,
                  marginPerLot: item.normalMargin.perLot,
                  marginType: scriptNormalCheck.marginType,
                  createdBy: {
                    id: currUserId,
                  },
                  updatedBy: {
                    id: currUserId,
                  },
                  user: {
                    id: childId,
                  },
                });
              }
            } else {
              if (defaultNormalCheck) {
                if (
                  defaultNormalCheck.marginPerCrore <
                    item.normalMargin.perCrore ||
                  defaultNormalCheck.marginPerLot < item.normalMargin.perLot
                ) {
                  finalData.normal.push({
                    instrumentName: item.name,
                    marginPerCrore: item.normalMargin.perCrore,
                    marginPerLot: item.normalMargin.perLot,
                    marginType: defaultNormalCheck.marginType,
                    createdBy: {
                      id: currUserId,
                    },
                    updatedBy: {
                      id: currUserId,
                    },
                    user: {
                      id: childId,
                    },
                  });
                }
              }
            }
          });
        }

        if (item.intradayMargin) {
          finalData.intraday.push({
            instrumentName: item.name,
            marginPerCrore: item.intradayMargin.perCrore,
            marginPerLot: item.intradayMargin.perLot,
            marginType: item.marginType,
            createdBy: {
              id: currUserId,
            },
            updatedBy: {
              id: currUserId,
            },
            user: {
              id: data.userId,
            },
          });

          childUserIds.map((childId) => {
            let scriptIntradayCheck =
              childUserMarginSettings.scriptIntradayMargin.find(
                (a) => a.user.id == childId && a.instrumentName == item.name
              );

            let defaultIntradayCheck =
              childUserMarginSettings.defaultIntradayMargin.find(
                (a) =>
                  a.user.id == childId &&
                  a.exchange.exchangeName == item.exchange
              );

            if (scriptIntradayCheck) {
              if (
                scriptIntradayCheck.marginPerCrore <
                  item.intradayMargin.perCrore ||
                scriptIntradayCheck.marginPerLot < item.intradayMargin.perLot
              ) {
                finalData.intraday.push({
                  instrumentName: item.name,
                  marginPerCrore: item.intradayMargin.perCrore,
                  marginPerLot: item.intradayMargin.perLot,
                  marginType: scriptIntradayCheck.marginType,
                  createdBy: {
                    id: currUserId,
                  },
                  updatedBy: {
                    id: currUserId,
                  },
                  user: {
                    id: childId,
                  },
                });
              }
            } else {
              if (defaultIntradayCheck) {
                if (
                  defaultIntradayCheck.marginPerCrore <
                    item.intradayMargin.perCrore ||
                  defaultIntradayCheck.marginPerLot < item.intradayMargin.perLot
                ) {
                  finalData.intraday.push({
                    instrumentName: item.name,
                    marginPerCrore: item.intradayMargin.perCrore,
                    marginPerLot: item.intradayMargin.perLot,
                    marginType: defaultIntradayCheck.marginType,
                    createdBy: {
                      id: currUserId,
                    },
                    updatedBy: {
                      id: currUserId,
                    },
                    user: {
                      id: childId,
                    },
                  });
                }
              }
            }
          });
        }
      }
    });

    return finalData;
  }

  public static async updateMarginSettings(
    data: UpdateMargin,
    currUserId: number
  ): Promise<{ data?: any; msg: string; status: boolean }> {
    let user = new User({ userId: data.userId });
    let normalValidation = await this.validateNormalMarginSettings(data, user);
    console.log('n validation', normalValidation);
    if (normalValidation.status == false) {
      return normalValidation;
    }

    let intradayValidation = await this.validateIntradayMarginSettings(
      data,
      user
    );
    console.log('validation', intradayValidation);
    if (intradayValidation.status == false) {
      return intradayValidation;
    }

    let parsedData = await this.instrumentsDataParser(data, user, currUserId);
    let marginSetting = new MarginSettings({ userId: data.userId });
    console.log('parsed data ', parsedData);
    AppDataSource.transaction(async (tmanager) => {
      marginSetting.setTransactionManager(tmanager);
      await marginSetting.upsertMarginSettings(parsedData);
    });

    return { status: true, data: parsedData, msg: '' };
  }
}

export default MarginService;
