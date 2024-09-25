import { H1 } from '@/components/inputs/heading';
import { I } from '@/components/inputs/tooltip';
import useFetch from '@/hooks/useFetch';
import { useReconciliation } from '@/store/tools/reconciliation';
import Routes from '@/utils/routes';
import { Layout } from 'antd';
import React, { useEffect } from 'react';

const Index = () => {
  const { apiCall } = useFetch();
  return (
    <Layout className="pt-0 px-[5px] md:px-[24px] pb-[24px] bg-[var(--light-bg)])]">
      <div className="mb-4 flex items-center space-x-3">
        <H1>Reconciliation </H1>
        <I text="Search User tooltop"></I>
      </div>
    </Layout>
  );
};

export default Index;
