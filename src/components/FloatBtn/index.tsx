import React, { useState } from 'react';
import { FloatButton } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useEditMode } from '@/components/common/ContextProvider';
import ThemeModal from '../ThemeProvider/ThemeModal';

const FloatBtn: React.FC = () => {
  const { editMode, setEditMode } = useEditMode();
  const [open, setOpen] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
  };

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
          onClick={showModal}
          icon={<FontAwesomeIcon icon={['fas', 'fill-drip']} />}
        />
      </FloatButton.Group>
      <ThemeModal open={open} onClose={handleCancel} />
    </>
  );
};

export default FloatBtn;
