export type GetProjectSettings = {
  pageNumber: number;
  pageSize: number;
  prjSettKey: string;
  prjSettName: string;
  sort: {
    key:
      | 'prjSettKey'
      | 'prjSettName'
      | 'prjSettConstant'
      | 'prjSettDisplayName';
    value: 'ASC' | 'DESC';
  };
};
