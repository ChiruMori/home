import React, { useEffect, useState } from 'react';
import { Modal, Button, FloatButton, ColorPicker, Space, Radio } from 'antd';
import { useTheme, lightTheme, darkTheme } from './ThemeContext';
import { ThemeModalProps } from './types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import storage from '@/helper/localHolder';

interface ColorFormData {
  bgBase: string;
  textBase: string;
  link: string;
  error: string;
  warning: string;
  success: string;
  info: string;
  primary: string;
  algorithm: 'dark' | 'light';
}

const ThemeModal: React.FC<ThemeModalProps> = ({ open, onClose }) => {
  const { theme, setTheme } = useTheme();

  // 使用状态对象管理颜色
  const [colors, setColors] = useState<ColorFormData>(theme);

  // 当 modal 打开时，初始化颜色值
  useEffect(() => {
    if (open) {
      setColors(theme);
    }
  }, [open, theme]);

  const handleSave = function () {
    const themeToSave = {
      ...colors,
      algorithm: colors.algorithm || 'dark',
    };
    setTheme(themeToSave);
    storage.setAsync('theme', themeToSave);
    onClose();
  };

  return (
    <Modal
      title="配置主题"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="submit" type="primary" onClick={handleSave}>
          确定
        </Button>,
      ]}
    >
      <Space
        direction="vertical"
        size="middle"
        style={{ display: 'flex', padding: '12px 0px' }}
      >
        <Space>
          <span>主背景色：</span>
          <ColorPicker
            showText
            value={colors.bgBase}
            onChange={(color) => {
              setColors({ ...colors, bgBase: color.toHexString() });
            }}
          />
        </Space>
        <Space>
          <span>主文本色：</span>
          <ColorPicker
            showText
            value={colors.textBase}
            onChange={(color) => {
              setColors({ ...colors, textBase: color.toHexString() });
            }}
          />
        </Space>
        <Space>
          <span>成功颜色：</span>
          <ColorPicker
            showText
            value={colors.success}
            onChange={(color) => {
              setColors({ ...colors, success: color.toHexString() });
            }}
          />
        </Space>
        <Space>
          <span>错误颜色：</span>
          <ColorPicker
            showText
            value={colors.error}
            onChange={(color) => {
              setColors({ ...colors, error: color.toHexString() });
            }}
          />
        </Space>
        <Space>
          <span>警告颜色：</span>
          <ColorPicker
            showText
            value={colors.warning}
            onChange={(color) => {
              setColors({ ...colors, warning: color.toHexString() });
            }}
          />
        </Space>
        <Space>
          <span>信息颜色：</span>
          <ColorPicker
            showText
            value={colors.info}
            onChange={(color) => {
              setColors({ ...colors, info: color.toHexString() });
            }}
          />
        </Space>
        <Space>
          <span>链接颜色：</span>
          <ColorPicker
            showText
            value={colors.link}
            onChange={(color) => {
              setColors({ ...colors, link: color.toHexString() });
            }}
          />
        </Space>
        <Space>
          <span>组件颜色：</span>
          <ColorPicker
            showText
            value={colors.primary}
            onChange={(color) => {
              setColors({
                ...colors,
                primary: color.toHexString(),
              });
            }}
          />
        </Space>
        <Space>
          <span>主题类型：</span>
          <Radio.Group
            buttonStyle="solid"
            value={colors.algorithm}
            onChange={(e) => {
              setColors({ ...colors, algorithm: e.target.value });
            }}
          >
            <Radio.Button value="dark">深色</Radio.Button>
            <Radio.Button value="light">浅色</Radio.Button>
          </Radio.Group>
        </Space>
      </Space>
      {/* 预设快捷选项 */}
      <FloatButton.Group
        trigger="click"
        type="primary"
        style={{
          insetInlineEnd: 24,
          position: 'absolute',
          bottom: 18,
          left: 24,
          right: 'unset',
        }}
        placement="right"
        icon={<FontAwesomeIcon icon={['fas', 'palette']} />}
      >
        <FloatButton
          onClick={() => setColors(lightTheme)}
          icon={<FontAwesomeIcon icon={['fas', 'sun']} />}
        />
        <FloatButton
          onClick={() => setColors(darkTheme)}
          icon={<FontAwesomeIcon icon={['fas', 'moon']} />}
        />
      </FloatButton.Group>
    </Modal>
  );
};

export default ThemeModal;
