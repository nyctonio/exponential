import {
  m_exchangesetting,
  m_intradaytrademarginsetting,
  m_scriptquantity,
  m_trademarginsetting,
  m_user,
  m_userbrokeragesetting,
  t_userlogin,
  t_userstatuslogs,
  t_usertransactionledger,
} from 'database/sql/schema';
import { EntityManager, ILike } from 'typeorm';

export class CREATE {
  user_data: m_user = null;
  userId: number = null;
  userName: string = null;
  tmanager: EntityManager = null;
  constructor({ userId, userName }: { userId?: number; userName?: string }) {
    this.userId = userId;
    this.userName = userName;
  }
  async setTransactionManager(tmanager: EntityManager) {
    this.tmanager = tmanager;
  }
}
