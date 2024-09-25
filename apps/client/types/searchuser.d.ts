export type SearchedUser = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  tradeAutoCut: boolean;
  onlySquareOff: boolean;
  createdAt: string;
  userType: {
    id: number;
    prjSettDisplayName: string;
    prjSettConstant: string;
  };
  createdByUser: {
    username: string;
  };
  userStatus: {
    id: number;
    prjSettDisplayName: string;
    prjSettConstant: string;
  };
}[];
