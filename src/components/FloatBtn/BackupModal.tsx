import React, { useEffect, useState } from 'react';
import { Modal, Input, Button, Popconfirm } from 'antd';

import storage from '@/helper/localHolder';

interface BackupModalProps {
  visible: boolean;
  onOk: () => void;
  onCancel: () => void;
}

const BackupModal: React.FC<BackupModalProps> = ({
  visible,
  onOk,
  onCancel,
}) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    const readData = async () => {
      if (visible) {
        // 从本地存储中读取数据
        const backupString = (await storage.exportAll()) as string;
        setValue(backupString);
      }
    };
    readData();
  }, [visible]);

  const handleOk = () => {
    storage.importAll(value);
    onOk();
  };

  return (
    <>
      <Modal
        title="备份与恢复"
        open={visible}
        onOk={handleOk}
        onCancel={onCancel}
        footer={[
          <Popconfirm
            key="popconfirm"
            title="确定使用当前数据覆盖本地存储？"
            onConfirm={handleOk}
            okText="确定"
            cancelText="取消"
          >
            <Button key="submit" type="primary">
              恢复
            </Button>
          </Popconfirm>,
        ]}
      >
        <Input.TextArea
          value={value}
          rows={4}
          onChange={(e) => {
            setValue(e.target.value);
          }}
        />
      </Modal>
    </>
  );
};

export default BackupModal;
