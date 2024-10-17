import React, { useState } from 'react';
import {
  ConfigProvider,
  ThemeConfig,
  theme,
  Layout,
  Menu,
  Typography,
  Space,
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
  const [collapsed, setCollapsed] = useState(false);

  const convertTheme = (themeConfig: ThemeData): ThemeConfig => {
    const themeToUse =
      themeConfig.algorithm === 'dark'
        ? theme.darkAlgorithm
        : theme.defaultAlgorithm;
    return {
      token: {
        // 主题色（文字）
        // colorPrimary: themeConfig.primaryColor,
        // // 背景色
        // colorWhite: themeConfig.bgColor,
      },
      // components: {
      //   Button: {
      //     // 主题色（按钮）
      //     colorPrimary: themeConfig.components.primaryColor,
      //   },
      // },
      algorithm: themeToUse,
    };
  };

  return (
    <ConfigProvider theme={convertTheme(themeConfig)}>
      <EditModeProvider>
        <Layout
          style={{
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          {/* 顶部导航栏*/}
          <Header></Header>
          <Content style={{ padding: '12px' }}>
            {/* 侧边栏 */}
            <aside className="main-sidebar"></aside>
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
                Copyright ©{new Date().getFullYear()}
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
      </EditModeProvider>
    </ConfigProvider>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Main />
    </ThemeProvider>
  );
};

export default App;
