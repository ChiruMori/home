import React from 'react';

import './App.less';
import './helper/icons';
import { SearchTypeEnum } from './components/SearchBar/types';
import SearchBarComponent from './components/SearchBar';
import BookmarksComponent from './components/Bookmarks';
import { EditModeProvider } from './components/common/ContextProvider';
import FloatBtn from './components/FloatBtn';

const App: React.FC = () => {
  return (
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
  );
};

export default App;
