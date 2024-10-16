import React from 'react';
import { ConfigProvider, ThemeConfig, theme } from 'antd';

import './App.less';
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
  const { theme } = useTheme();

  const convertTheme = (theme: ThemeData): ThemeConfig => {
    return {
      token: {
        // 主题色（文字）
        colorPrimary: theme.primaryColor,
        // 背景色
        colorBgBase: theme.bgColor,
      },
      components: {
        Button: {
          // 主题色（按钮）
          colorPrimary: theme.components.primaryColor,
        },
      },
    };
  };

  return (
    <ConfigProvider theme={convertTheme(theme)}>
      <div className="App">
        <EditModeProvider>
          {/* 顶部导航栏*/}
          <header className="main-header"></header>
          {/* 侧边栏 */}
          <aside className="main-sidebar"></aside>
          {/* 搜索栏 */}
          <SearchBarComponent type={SearchTypeEnum.GOOGLE} />
          {/* 书签区域 */}
          <BookmarksComponent />
          {/* 浮动按钮 */}
          <FloatBtn />
          {/* 底部版权声明 */}
          <footer className="main-footer"></footer>
        </EditModeProvider>
      </div>
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
