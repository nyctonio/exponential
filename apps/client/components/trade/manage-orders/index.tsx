import Header from './header';
import Table from './table';
// import { Pagination } from 'antd';
// import { useState } from 'react';

const Index = () => {
  // const [tableData, setTableData] = useState({
  //   users: [],
  //   totalCount: 100,
  //   pageNumber: 1,
  //   pageSize: 10,
  //   loading: false,
  // });
  return (
    <>
      <div className="w-full h-full px-4">
        <div>
          <Header />
        </div>
        <div className="mt-4">
          <Table />
        </div>
      </div>
    </>
  );
};

export default Index;
