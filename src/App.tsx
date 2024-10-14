import React from 'react';

import './App.less';
import './helper/icons';
import { SearchTypeEnum } from './components/Bookmarks/types';
import SearchBarComponent from './components/SearchBar';
import BookmarksComponent from './components/Bookmarks/Bookmarks';

const App: React.FC = () => {
  const [editMode, setEditMode] = React.useState(true);
  return (
    <div className="App">
      {/* 顶部导航栏*/}
      <header className="main-header"></header>
      {/* 侧边栏 */}
      <aside className="main-sidebar"></aside>
      {/* 搜索栏 */}
      <SearchBarComponent type={SearchTypeEnum.GOOGLE} />
      {/* 书签区域 */}
      <BookmarksComponent editMode={editMode} />
      {/* 底部版权声明 */}
      <footer className="main-footer"></footer>
    </div>
  );
};

export default App;
