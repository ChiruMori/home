import React, { useState } from 'react';
import { FloatButton } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useEditMode } from '@/components/common/ContextProvider';
import ThemeModal from '../ThemeProvider/ThemeModal';
import BackupModal from './BackupModal';

const FloatBtn: React.FC = () => {
  const { editMode, setEditMode } = useEditMode();
  const [open, setOpen] = useState(false);
  const [backupVisible, setBackupVisible] = useState(false);

  return (
    <>
      <FloatButton.Group
        trigger="click"
        type="primary"
        style={{ insetInlineEnd: 24 }}
        icon={<FontAwesomeIcon icon={['fas', 'magic-wand-sparkles']} />}
        badge={editMode ? { dot: true } : undefined}
      >
        <FloatButton
          onClick={() => setEditMode(!editMode)}
          icon={<FontAwesomeIcon icon={['fas', 'edit']} bounce={editMode} />}
        />
        <FloatButton
          onClick={() => setBackupVisible(!backupVisible)}
          icon={<FontAwesomeIcon icon={['fas', 'floppy-disk']} />}
        />
        <FloatButton
          onClick={() => setOpen(true)}
          icon={<FontAwesomeIcon icon={['fas', 'fill-drip']} />}
        />
      </FloatButton.Group>
      <ThemeModal open={open} onClose={() => setOpen(false)} />
      <BackupModal
        visible={backupVisible}
        onCancel={() => setBackupVisible(false)}
        onOk={() => {}}
      />
    </>
  );
};

export default FloatBtn;
