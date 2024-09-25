import { PrimaryButton } from '@/components/inputs/button';
import { H1 } from '@/components/inputs/heading';
import { BorderInput, LabeledWrapper } from '@/components/inputs/text';
import { I } from '@/components/inputs/tooltip';
import { Layout, Table } from 'antd';
import React from 'react';
import TAndCEditor from './editor';

const Index = () => {
  return (
    <Layout className="pt-0 px-[5px] md:px-[24px] pb-[24px] bg-[var(--light-bg)])]">
      <div className="mb-4 flex items-center space-x-3">
        <H1>Terms and Conditions </H1>
        <I text="Search User tooltop"></I>
      </div>
      <TAndCEditor />
    </Layout>
  );
};

export default Index;
