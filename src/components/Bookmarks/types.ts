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

export interface BookmarkModalProps {
  visible: boolean;
  editMode: boolean;
  onOk: (values: Bookmark, initTitle?: string) => void;
  onCancel: () => void;
  onDelete?: () => void;
  form?: Bookmark;
}
