import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';

/**
 * 搜索引擎类型枚举
 */
export enum SearchTypeEnum {
  GOOGLE = 'GOOGLE',
  GITHUB = 'GITHUB',
  BAIDU = 'BAIDU',
  BING = 'BING',
  BILIBILI = 'BILIBILI',
  YOUTUBE = 'YOUTUBE',
}

export function getSearchUrl(type: SearchTypeEnum): string {
  switch (type) {
    case SearchTypeEnum.GOOGLE:
      return 'https://www.google.com/search?q=';
    case SearchTypeEnum.GITHUB:
      return 'https://github.com/search?q=';
    case SearchTypeEnum.BAIDU:
      return 'https://www.baidu.com/s?wd=';
    case SearchTypeEnum.BING:
      return 'https://cn.bing.com/search?q=';
    case SearchTypeEnum.BILIBILI:
      return 'https://search.bilibili.com/all?keyword=';
    case SearchTypeEnum.YOUTUBE:
      return 'https://www.youtube.com/results?search_query=';
    default:
      return '#';
  }
}

export function getSearchName(type: SearchTypeEnum): string {
  switch (type) {
    case SearchTypeEnum.GOOGLE:
      return 'Google';
    case SearchTypeEnum.GITHUB:
      return 'GitHub';
    case SearchTypeEnum.BAIDU:
      return '百度';
    case SearchTypeEnum.BING:
      return '必应';
    case SearchTypeEnum.BILIBILI:
      return '哔哩哔哩';
    case SearchTypeEnum.YOUTUBE:
      return '油管';
    default:
      return '未知';
  }
}

export function getSearchIcon(type: SearchTypeEnum): [IconPrefix, IconName] {
  switch (type) {
    case SearchTypeEnum.GOOGLE:
      return ['fab', 'google'];
    case SearchTypeEnum.GITHUB:
      return ['fab', 'github'];
    case SearchTypeEnum.BAIDU:
      return ['fas', 'paw'];
    case SearchTypeEnum.BING:
      return ['fab', 'microsoft'];
    case SearchTypeEnum.BILIBILI:
      return ['fab', 'bilibili'];
    case SearchTypeEnum.YOUTUBE:
      return ['fab', 'youtube'];
    default:
      return ['fas', 'question'];
  }
}

export enum BookmarkType {
  // 普通快捷方式
  URL = 'URL',
  // 可以放置一个缩略图
  IMG = 'IMG',
  // 添加按钮
  ADD = 'ADD',
}

export interface Bookmark {
  title: string;
  desc: string;
  action: string;
  avatar: string;
  type: BookmarkType;
  cover?: string;
}

export interface BookmarksGroup {
  title: string;
  bookmarks: Bookmark[];
}
