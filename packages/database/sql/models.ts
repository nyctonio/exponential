import { AppDataSource } from '.';
import collection, { m_rent, t_settlementlogs } from './schema';

export const models = {
  m_user: AppDataSource.getRepository(collection.m_user),
  m_projectsetting: AppDataSource.getRepository(collection.m_projectsetting),
  t_userlogin: AppDataSource.getRepository(collection.t_userlogin),
  m_userwatchlist: AppDataSource.getRepository(collection.m_userwatchlist),
  m_watchlistcolumn: AppDataSource.getRepository(collection.m_watchlistcolumn),
  m_instruments: AppDataSource.getRepository(collection.m_instruments),
  m_exchange: AppDataSource.getRepository(collection.m_exchange),
  m_exchangesetting: AppDataSource.getRepository(collection.m_exchangesetting),
  m_trademarginsetting: AppDataSource.getRepository(
    collection.m_trademarginsetting
  ),
  m_userbrokeragesetting: AppDataSource.getRepository(
    collection.m_userbrokeragesetting
  ),
  m_menu: AppDataSource.getRepository(collection.m_menu),
  m_submenu: AppDataSource.getRepository(collection.m_submenu),
  m_usermanual: AppDataSource.getRepository(collection.m_usermanual),
  t_usertransactionledger: AppDataSource.getRepository(
    collection.t_usertransactionledger
  ),
  m_intradaytrademarginsetting: AppDataSource.getRepository(
    collection.m_intradaytrademarginsetting
  ),
  m_democreationbalance: AppDataSource.getRepository(
    collection.m_democreationbalance
  ),
  m_defaultfunctionmapping: AppDataSource.getRepository(
    collection.m_defaultfunctionmapping
  ),
  m_functionmaster: AppDataSource.getRepository(collection.m_functionmaster),
  m_userfunctionmapping: AppDataSource.getRepository(
    collection.m_userfunctionmapping
  ),
  t_userstatuslogs: AppDataSource.getRepository(collection.t_userstatuslogs),
  m_scriptquantity: AppDataSource.getRepository(collection.m_scriptquantity),
  m_routefunctionmapping: AppDataSource.getRepository(
    collection.m_routefunctionmapping
  ),
  m_scripttrademarginsetting: AppDataSource.getRepository(
    collection.m_scripttrademarginsetting
  ),
  m_scriptintradaymarginsetting: AppDataSource.getRepository(
    collection.m_scriptintradaymarginsetting
  ),
  m_scriptbrokeragesetting: AppDataSource.getRepository(
    collection.m_scriptbrokeragesetting
  ),
  m_userplsharing: AppDataSource.getRepository(collection.m_userplsharing),
  m_userbidstopsettings: AppDataSource.getRepository(
    collection.m_userbidstopsettings
  ),
  m_usermcxbidstopsettings: AppDataSource.getRepository(
    collection.m_usermcxbidstopsettings
  ),
  m_notification: AppDataSource.getRepository(collection.m_notification),
  m_staticcontent: AppDataSource.getRepository(collection.m_staticcontent),
  m_leads: AppDataSource.getRepository(collection.m_leads),
  m_usercuttingsettings: AppDataSource.getRepository(
    collection.m_usercuttingsettings
  ),
  t_instrumentstaging: AppDataSource.getRepository(
    collection.t_instrumentstaging
  ),
  t_tradestatus: AppDataSource.getRepository(collection.t_tradestatus),
  m_contact: AppDataSource.getRepository(collection.m_contact),
  m_usersuspicioustrademapping: AppDataSource.getRepository(
    collection.m_usersuspicioustrademapping
  ),
  m_rent: AppDataSource.getRepository(collection.m_rent),
  m_rentsharing: AppDataSource.getRepository(collection.m_rentsharing),
  m_penalty: AppDataSource.getRepository(collection.m_penalty),
  t_userpenaltyrecords: AppDataSource.getRepository(
    collection.t_userpenaltyrecords
  ),
  m_notification_main: AppDataSource.getRepository(
    collection.m_notification_main
  ),
  m_broadcastmessagesuser: AppDataSource.getRepository(
    collection.m_broadcastmessagesuser
  ),
  m_broadcastmessages: AppDataSource.getRepository(
    collection.m_broadcastmessages
  ),
  m_usercreationcount: AppDataSource.getRepository(
    collection.m_usercreationcount
  ),
  t_scriptreconciliation: AppDataSource.getRepository(
    collection.t_scriptreconciliation
  ),
  t_settlementlogs: AppDataSource.getRepository(collection.t_settlementlogs),
};
