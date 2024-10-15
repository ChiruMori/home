import React from 'react';
import { FloatButton } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useEditMode } from '@/components/common/ContextProvider';

const FloatBtn: React.FC = () => {
  const { editMode, setEditMode } = useEditMode();

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
          type={editMode ? 'primary' : 'default'}
          onClick={() => setEditMode(!editMode)}
          icon={<FontAwesomeIcon icon={['fas', 'edit']} bounce={editMode} />}
        />
        <FloatButton icon={<FontAwesomeIcon icon={['fas', 'fill-drip']} />} />
      </FloatButton.Group>
    </>
  );
};

export default FloatBtn;
