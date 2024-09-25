type InstrumentType = {
  name: string;
  exchange: string;
  upline: {
    perCrore: number;
    perLot: number;
    default: boolean;
    edited: boolean;
  };
  user: {
    perCrore: number | null;
    perLot: number | null;
    active: 'lot' | 'crore';
    edited: boolean;
    default: boolean;
  };
  updatedAt: string;
};

export { InstrumentType };
