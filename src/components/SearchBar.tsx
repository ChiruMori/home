import React, { useEffect } from 'react';
import { Input, Dropdown, Button, Space, type MenuProps } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import '../enums/SearchTypeEnum';
import './SearchBar.less';

import {
  SearchTypeEnum,
  getSearchUrl,
  getSearchName,
  getSearchIcon,
} from '../enums/SearchTypeEnum';

const SearchTypeSelect: React.FC<{
  searchType: SearchTypeEnum;
  setSearchType: (type: SearchTypeEnum) => void;
}> = ({ searchType, setSearchType }) => {
  // 选择搜索引擎类型
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    setSearchType(e.key as SearchTypeEnum);
  };

  const items: MenuProps['items'] = [
    {
      key: SearchTypeEnum.GOOGLE,
      icon: <FontAwesomeIcon icon={getSearchIcon(SearchTypeEnum.GOOGLE)} />,
      label: getSearchName(SearchTypeEnum.GOOGLE),
    },
    {
      key: SearchTypeEnum.GITHUB,
      icon: <FontAwesomeIcon icon={getSearchIcon(SearchTypeEnum.GITHUB)} />,
      label: getSearchName(SearchTypeEnum.GITHUB),
    },
    {
      key: SearchTypeEnum.BAIDU,
      icon: <FontAwesomeIcon icon={getSearchIcon(SearchTypeEnum.BAIDU)} />,
      label: getSearchName(SearchTypeEnum.BAIDU),
    },
    {
      key: SearchTypeEnum.BING,
      icon: <FontAwesomeIcon icon={getSearchIcon(SearchTypeEnum.BING)} />,
      label: getSearchName(SearchTypeEnum.BING),
    },
    {
      key: SearchTypeEnum.BILIBILI,
      icon: <FontAwesomeIcon icon={getSearchIcon(SearchTypeEnum.BILIBILI)} />,
      label: getSearchName(SearchTypeEnum.BILIBILI),
    },
    {
      key: SearchTypeEnum.YOUTUBE,
      icon: <FontAwesomeIcon icon={getSearchIcon(SearchTypeEnum.YOUTUBE)} />,
      label: getSearchName(SearchTypeEnum.YOUTUBE),
    },
  ];

  const menuProps = {
    items,
    onClick: handleMenuClick,
  };

  return (
    <Dropdown menu={menuProps}>
      <Button>
        <Space>
          <FontAwesomeIcon icon={getSearchIcon(searchType)} />
        </Space>
      </Button>
    </Dropdown>
  );
};

// 搜索栏组件
const SearchBarComponent: React.FC<{ type: SearchTypeEnum }> = ({ type }) => {
  const [searchType, setSearchType] = React.useState<SearchTypeEnum>(
    SearchTypeEnum.GOOGLE,
  );

  useEffect(() => {
    // TODO: 从 localStorage 中读取搜索引擎类型
    const searchTypeFromLocal = localStorage.getItem('searchType');
    if (searchTypeFromLocal) {
      setSearchType(searchTypeFromLocal as SearchTypeEnum);
    }
  }, [type]);

  return (
    <Input.Search
      id="search-input"
      placeholder={getSearchName(searchType)}
      addonBefore={
        <SearchTypeSelect
          searchType={searchType}
          setSearchType={setSearchType}
        />
      } // 传递 searchType
      allowClear
      onSearch={(val) => onSearch(searchType, val)}
    />
  );
};

// 将 Search 中输入的内容拼接到 URL 后面，在新标签页中打开
const onSearch = (type: SearchTypeEnum, value: string) => {
  if (value === '') {
    return;
  }
  window.open(getSearchUrl(type) + value);
};

export default SearchBarComponent;
