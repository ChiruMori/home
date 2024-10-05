import React from 'react';

import './App.less';
import './helper/icons';
import { SearchTypeEnum } from './enums/SearchTypeEnum';
import SearchBarComponent from './components/SearchBar';

const App: React.FC = () => {
  return (
    <div className="App">
      {/* 顶部导航栏*/}
      <header className="main-header"></header>
      {/* 侧边栏 */}
      <aside className="main-sidebar"></aside>
      {/* 搜索栏 */}
      <SearchBarComponent type={ SearchTypeEnum.GOOGLE } />
      {/* 书签区域 */}
      <div className="bookmark-area"></div>
      {/* 底部版权声明 */}
      <footer className="main-footer"></footer>
    </div>
  );
};

export default App;
