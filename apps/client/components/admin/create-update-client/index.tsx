'use client';
import { Layout } from 'antd';
import CreateUserHeader from './header';
import Loading from '@/components/layout/loading';
import CreateUserMenu from './create-user-menu';
import useParentFetch from './useParentFetch';
import { useUserCreateStore } from '@/store/create-update-user';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import useRules from './rules';

const Index = () => {
  const { loading } = useParentFetch();
  const { sectionId, setSectionId } = useUserCreateStore();
  const { validate } = useRules();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get('edit');
  const { setErrors } = useUserCreateStore();

  useEffect(() => {
    if (sectionId > 4) {
      setSectionId(1);
    }

    if (isEdit) {
      const _valid = validate(true);
      if (Object.keys(_valid).length == 0) {
        setErrors('basicDetails', {});
        setErrors('exchangeSettings', {});
        setErrors('brokerageSettings', {});
        setErrors('marginSettings', {});
      }
    }
  }, []);
  if (loading) {
    return <Loading />;
  }

  return (
    <Layout
      className=""
      style={{
        padding: '0 24px 24px',
        backgroundColor: 'var(--light-bg)',
      }}
    >
      <CreateUserHeader />
      <CreateUserMenu />
    </Layout>
  );
};

export default Index;
