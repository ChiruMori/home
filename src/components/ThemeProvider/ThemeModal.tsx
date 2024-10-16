import React, { useEffect, useState } from 'react';
import { Modal, Button, FloatButton, ColorPicker, Space } from 'antd';
import { useTheme, lightTheme, darkTheme } from './ThemeContext';
import { ThemeData, ThemeModalProps } from './types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface GradientColorDot {
  color: string;
  percent: number;
}

interface ColorFormData {
  bgColor: string;
  primaryColor: string;
  components: {
    primaryColor: GradientColorDot[];
  };
  algorithm?: 'dark' | 'light';
}

const ThemeModal: React.FC<ThemeModalProps> = ({ open, onClose }) => {
  const { theme, setTheme } = useTheme();

  const cssGridentToColor = (css: string): GradientColorDot[] => {
    if (!css.startsWith('linear-gradient')) {
      return [];
    }
    // linear-gradient(90deg, rgb(0, 0, 0), rgb(255, 255, 255))
    const colorStr = css
      .substring(0, css.length - 1)
      .replace('linear-gradient(90deg, ', '');
    const colors = colorStr.split(',').map((c) => c.trim());
    return [
      {
        color: colors[0],
        percent: 0,
      },
      {
        color: colors[1],
        percent: 100,
      },
    ];
  };

  const themeToForm = (theme: ThemeData): ColorFormData => {
    return {
      bgColor: theme.bgColor,
      primaryColor: theme.primaryColor,
      components: {
        primaryColor: cssGridentToColor(theme.components.primaryColor),
      },
    };
  };

  const formToTheme = (form: ColorFormData): ThemeData => {
    return {
      bgColor: form.bgColor,
      primaryColor: form.primaryColor,
      components: {
        primaryColor: `linear-gradient(90deg, ${form.components.primaryColor[0].color}, ${form.components.primaryColor[1].color})`,
      },
      algorithm: form.algorithm || 'light',
    };
  };

  // 使用状态对象管理颜色
  const [colors, setColors] = useState<ColorFormData>(themeToForm(theme));

  // 当 modal 打开时，初始化颜色值
  useEffect(() => {
    if (open) {
      setColors(themeToForm(theme));
    }
  }, [open, theme]);

  const handleSave = function () {
    const themeForUpdate = formToTheme(colors);
    setTheme(themeForUpdate);
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
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        <Space>
          <span>背景颜色：</span>
          <ColorPicker
            showText
            value={colors.bgColor}
            onChange={(color) => {
              setColors({ ...colors, bgColor: color.toHexString() });
            }}
          />
        </Space>
        <Space>
          <span>主题颜色：</span>
          <ColorPicker
            showText
            value={colors.primaryColor}
            onChange={(color) => {
              setColors({ ...colors, primaryColor: color.toHexString() });
            }}
          />
        </Space>
        <Space>
          <span>组件主题颜色：</span>
          <ColorPicker
            mode="gradient"
            showText
            value={colors.components.primaryColor}
            onChange={(color) => {
              setColors({
                ...colors,
                components: {
                  primaryColor: color.getColors().map((c) => ({
                    color: c.color.toHexString(),
                    percent: c.percent,
                  })),
                },
              });
            }}
          />
        </Space>
      </Space>
      {/* 预设快捷选项 */}
      <FloatButton.Group
        trigger="click"
        type="primary"
        style={{ insetInlineEnd: 24 }}
        placement="left"
        icon={<FontAwesomeIcon icon={['fas', 'palette']} />}
      >
        <FloatButton
          onClick={() => setColors(themeToForm(lightTheme))}
          icon={<FontAwesomeIcon icon={['fas', 'sun']} />}
        />
        <FloatButton
          onClick={() => setColors(themeToForm(darkTheme))}
          icon={<FontAwesomeIcon icon={['fas', 'moon']} />}
        />
      </FloatButton.Group>
    </Modal>
  );
};

export default ThemeModal;
