export type SearchUserBodySort = {
  username: 'ASC' | 'DESC' | 'NONE';
  userType: 'ASC' | 'DESC' | 'NONE';
  upline: 'ASC' | 'DESC' | 'NONE';
  name: 'ASC' | 'DESC' | 'NONE';
  tradeAutoCut: 'ASC' | 'DESC' | 'NONE';
  onlySquareOff: 'ASC' | 'DESC' | 'NONE';
  createdDate: 'ASC' | 'DESC' | 'NONE';
  lastLogin: 'ASC' | 'DESC' | 'NONE';
};
export type SearchUserBody = {
  username: string;
  userType: string;
  upline: {
    broker: number[];
    subBroker: number[];
  };
  pageSize: number;
  pageNumber: number;
  sort: SearchUserBodySort;
};

export type TransactionBody = {
  userId: number;
  amount: number;
  remarks: string;
  type: 'Deposit' | 'Withdrawal';
  password: string;
};
