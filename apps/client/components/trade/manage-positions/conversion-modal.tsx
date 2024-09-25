import { Modal } from 'antd';
import React from 'react';
import ManageDeleteTradesTable from '../manage-delete-trades/table';

type Props = {
  title: string;
  open: boolean;
  close: () => void;
  intraday: boolean;
  script: string;
};

function ConversionModal({ title, close, open, intraday, script }: Props) {
  return (
    <Modal
      title={title}
      open={open}
      onCancel={close}
      centered
      okButtonProps={{ style: { display: 'none' } }}
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      <ManageDeleteTradesTable
        intraday={intraday}
        script={script}
        partial={true}
      />
    </Modal>
  );
}

export default ConversionModal;
