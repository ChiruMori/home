import React from 'react';
import {
  ConfigProvider,
  ThemeConfig,
  theme,
  Layout,
  Typography,
  Space,
  App,
} from 'antd';
import { Content, Footer, Header } from 'antd/es/layout/layout';

import './helper/icons';
import { SearchTypeEnum } from './components/SearchBar/types';
import SearchBarComponent from './components/SearchBar';
import BookmarksComponent from './components/Bookmarks';
import { EditModeProvider } from './components/common/ContextProvider';
import FloatBtn from './components/FloatBtn';
import {
  ThemeProvider,
  useTheme,
} from './components/ThemeProvider/ThemeContext';
import { ThemeData } from './components/ThemeProvider/types';

const Main: React.FC = () => {
  const { theme: themeConfig } = useTheme();

  const convertTheme = (themeConfig: ThemeData): ThemeConfig => {
    const themeToUse =
      themeConfig.algorithm === 'dark'
        ? theme.darkAlgorithm
        : theme.defaultAlgorithm;
    return {
      token: {
        colorBgBase: themeConfig.bgBase,
        colorTextBase: themeConfig.textBase,
        colorLink: themeConfig.link,
        colorError: themeConfig.error,
        colorWarning: themeConfig.warning,
        colorSuccess: themeConfig.success,
        colorInfo: themeConfig.info,
        colorPrimary: themeConfig.primary,
      },
      algorithm: themeToUse,
    };
  };

  return (
    <ConfigProvider theme={convertTheme(themeConfig)}>
      <EditModeProvider>
        <App notification={{ placement: 'topRight' }}>
          <Layout
            style={{
              height: '100vh',
              overflow: 'hidden',
            }}
          >
            {/* 顶部导航栏*/}
            <Header></Header>
            <Content style={{ padding: '12px' }}>
              {/* 搜索栏 */}
              <SearchBarComponent type={SearchTypeEnum.GOOGLE} />
              {/* 书签区域 */}
              <BookmarksComponent />
              {/* 浮动按钮 */}
              <FloatBtn />
            </Content>
            {/* 底部版权声明 */}
            <Footer style={{ textAlign: 'center' }}>
              <Space>
                <Typography.Text type="secondary">
                  Copyright ©{new Date().getFullYear()} Mori
                </Typography.Text>
                <Typography.Link
                  type="secondary"
                  href="http://beian.miit.gov.cn/"
                  target="_blank"
                >
                  辽ICP备17003106号-3
                </Typography.Link>
              </Space>
            </Footer>
          </Layout>
        </App>
      </EditModeProvider>
    </ConfigProvider>
  );
};

const AppContent: React.FC = () => {
  return (
    <ThemeProvider>
      <Main />
    </ThemeProvider>
  );
};

export default AppContent;
