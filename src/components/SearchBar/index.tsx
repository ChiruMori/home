import React, { useEffect } from 'react';
import { Input, Dropdown, Button, Space, type MenuProps } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import storage from '@/helper/localHolder';
import './index.less';
import {
  getSearchIcon,
  getSearchName,
  getSearchUrl,
  SearchTypeEnum,
} from './types';
import { useTheme } from '../ThemeProvider/ThemeContext';

const searchEngineKey = 'searchType';

const SearchTypeSelect: React.FC<{
  searchType: SearchTypeEnum;
  setSearchType: (type: SearchTypeEnum) => void;
}> = ({ searchType, setSearchType }) => {
  const { theme } = useTheme();
  // 选择搜索引擎类型
  const handleMenuClick: MenuProps['onClick'] = (e) => {
    const newSearchType = e.key as SearchTypeEnum;
    storage.set(searchEngineKey, newSearchType, () => {
      setSearchType(newSearchType);
    });
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
    <Dropdown menu={menuProps} className="search-drop">
      <Button
        style={{
          backgroundColor: theme.bgBase + 'AA',
        }}
      >
        <Space>
          <FontAwesomeIcon icon={getSearchIcon(searchType)} />
          <FontAwesomeIcon icon={['fas', 'caret-down']} />
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
    storage.get(searchEngineKey, (searchTypeFromLocal) => {
      if (searchTypeFromLocal) {
        setSearchType(searchTypeFromLocal as SearchTypeEnum);
      }
    });
  }, [type]);
  const { theme } = useTheme();

  return (
    <Space.Compact block className="search-bar">
      <SearchTypeSelect searchType={searchType} setSearchType={setSearchType} />
      <Input.Search
        size="large"
        placeholder={getSearchName(searchType)}
        allowClear
        onSearch={(val) => onSearch(searchType, val)}
        className="search-input"
      />
      <style>
        {`
          .search-input span, .search-input button {
            background-color: ${theme.bgBase + 'AA'};
          }
        `}
      </style>
    </Space.Compact>
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
