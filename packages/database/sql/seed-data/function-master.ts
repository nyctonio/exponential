const functionMasterData = [
  {
    funName: 'Admin Menu',
    funLevel: 'Menu',
    isFunActive: true,
    subMenu: {
      id: 1,
    },
  },
  {
    funName: 'Trade Menu',
    funLevel: 'Menu',
    isFunActive: true,
    subMenu: {
      id: 4,
    },
  },
  {
    funName: 'Reports Menu',
    funLevel: 'Menu',
    isFunActive: true,
    subMenu: {
      id: 8,
    },
  },
  {
    funName: 'Advance Settings Menu',
    funLevel: 'Menu',
    isFunActive: true,
    subMenu: {
      id: 16,
    },
  },
  {
    funName: 'Risk Management Menu',
    funLevel: 'Menu',
    isFunActive: true,
    subMenu: {
      id: 17,
    },
  },
  {
    funName: 'Tools Menu',
    funLevel: 'Menu',
    isFunActive: true,
    subMenu: {
      id: 21,
    },
  },
  {
    funName: 'Create/Update Client Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 1,
    },
  },
  {
    funName: 'Search User Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 2,
    },
  },
  {
    funName: 'User Access Management',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 3,
    },
  },
  {
    funName: 'Perform Trade Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 4,
    },
  },
  {
    funName: 'Manage & Delete Trade Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 5,
    },
  },
  {
    funName: 'Manual Reconcilation Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 6,
    },
  },
  {
    funName: 'Manage Positions Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 7,
    },
  },
  {
    funName: 'Accounts Statement Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 8,
    },
  },
  {
    funName: 'Trade Reports Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 9,
    },
  },
  {
    funName: 'P&L Reports Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 10,
    },
  },
  {
    funName: 'Brokerage Statement Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 11,
    },
  },
  {
    funName: 'Settelment Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 12,
    },
  },
  {
    funName: 'P&L & Brokerage Sharing Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 13,
    },
  },

  {
    funName: 'Auto Cut Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 14,
    },
  },
  {
    funName: 'Bid Stop Loss Section',
    funLevel: 'Section',
    isFunActive: true,
    subMenu: {
      id: 14,
    },
  },
  {
    funName: 'Bid Stop Loss Away CMP Section',
    funLevel: 'Section',
    isFunActive: true,
    subMenu: {
      id: 14,
    },
  },
  {
    funName: 'Brokerage Setting Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 15,
    },
  },
  {
    funName: 'Trade Margin Setting Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 16,
    },
  },
  {
    funName: 'Script Quantity Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 17,
    },
  },
  {
    funName: 'Set Up Suspicious Trade Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 18,
    },
  },
  {
    funName: 'Watch Suspicious Trade Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 19,
    },
  },
  {
    funName: 'Broadcast Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 20,
    },
  },
  {
    funName: 'Send Alert Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 21,
    },
  },
  {
    funName: 'Set Theme Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 22,
    },
  },
  {
    funName: 'Manage App Settings Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 24,
    },
  },
  {
    funName: 'Add/Update T&C Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 25,
    },
  },
  {
    funName: 'Advertise Contact Us Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 26,
    },
  },
  {
    funName: 'Manage Support Calls Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 27,
    },
  },
  {
    funName: 'Withdraw Balance',
    funLevel: 'Operation',
    isFunActive: true,
    subMenu: {
      id: 2,
    },
  },
  {
    funName: 'Square Off',
    funLevel: 'Operation',
    isFunActive: true,
    subMenu: {
      id: 7,
    },
  },
  {
    funName: 'Perform Trade',
    funLevel: 'Operation',
    isFunActive: true,
    subMenu: {
      id: 4,
    },
  },
  {
    funName: 'Change Password',
    funLevel: 'Operation',
    isFunActive: true,
    subMenu: {
      id: 2,
    },
  },

  {
    funName: 'Update PL Share Settings',
    funLevel: 'Operation',
    isFunActive: true,
    subMenu: {
      id: 13,
    },
  },

  {
    funName: 'Update Auto Cut Settings',
    funLevel: 'Operation',
    isFunActive: true,
    subMenu: {
      id: 14,
    },
  },

  {
    funName: 'Update Brokerage Settings',
    funLevel: 'Operation',
    isFunActive: true,
    subMenu: {
      id: 15,
    },
  },

  {
    funName: 'Update Trade Margin Settings',
    funLevel: 'Operation',
    isFunActive: true,
    subMenu: {
      id: 16,
    },
  },
  {
    funName: 'Update Script Quantity Settings',
    funLevel: 'Operation',
    isFunActive: true,
    subMenu: {
      id: 17,
    },
  },
  {
    funName: 'Manage Default Functions Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 28,
    },
  },
  {
    funName: 'Manage Orders Screen',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 29,
    },
  },
  {
    funName: 'Watch Logs',
    funLevel: 'Screen',
    isFunActive: true,
    subMenu: {
      id: 30,
    },
  },
];

export default functionMasterData;
