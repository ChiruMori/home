import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, List, Collapse, type CollapseProps } from 'antd';

import './Bookmarks.less';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';
// import storage from "../helper/localHolder";

enum BookmarkType {
  // 普通快捷方式
  URL = 'URL',
  // 可以放置一个缩略图
  IMG = 'IMG',
  // 添加按钮
  ADD = 'ADD',
}

interface Bookmark {
  title: string;
  desc: string;
  action: string;
  avatar: [IconPrefix, IconName];
  type: BookmarkType;
  cover?: string;
}

interface BookmarksGroup {
  title: string;
  bookmarks: Bookmark[];
}

const initBookmarks = [
  {
    title: 'Group1',
    bookmarks: [
      {
        title: 'Google',
        desc: 'Google Search',
        action: 'https://www.google.com',
        avatar: ['fab', 'google'],
        type: BookmarkType.URL,
      },
      {
        title: 'Google2',
        desc: 'Google Search',
        action: 'https://www.google.com',
        avatar: ['fab', 'google'],
        type: BookmarkType.URL,
      },
      {
        title: 'Google3',
        desc: 'Google Search',
        action: 'https://www.google.com',
        avatar: ['fab', 'google'],
        type: BookmarkType.URL,
      },
      {
        title: 'Google4',
        desc: 'Google Search',
        action: 'https://www.google.com',
        avatar: ['fab', 'google'],
        type: BookmarkType.URL,
      },
    ],
  },
  {
    title: 'Group2',
    bookmarks: [
      {
        title: 'Google5',
        desc: 'Google Search',
        action: 'https://www.google.com',
        type: BookmarkType.IMG,
        cover:
          'https://mori.plus/upload/thumbnails/2024/w800/moricirclezip.png',
      },
      {
        title: 'Google6',
        desc: 'Google Search',
        action: 'https://www.google.com',
        avatar: ['fab', 'google'],
        type: BookmarkType.URL,
      },
    ],
  },
] as BookmarksGroup[];
// TODO: 初始化，获取本地存储的数据

const BookmarksComponent: React.FC = () => {
  const [bookmarkGroups, setBookmarkGroups] = useState(initBookmarks);

  // 拖拽的哪个卡片
  const onDragCard = (
    event: React.DragEvent<HTMLDivElement>,
    fromGroup: string,
    fromTitle: string,
  ) => {
    event.dataTransfer.setData('fromGrp', fromGroup);
    event.dataTransfer.setData('from', fromTitle);
  };
  // 拖拽到哪个卡片
  const onDropCard = (
    event: React.DragEvent<HTMLDivElement>,
    toGroup: string,
    toTitle: string,
  ) => {
    event.preventDefault();
    const fromGroupTitle = event.dataTransfer.getData('fromGrp');
    const fromTitle = event.dataTransfer.getData('from');
    // 更新顺序，将当前书签插入到指定位置
    const bookmarksTmp = bookmarkGroups.slice();
    const targetGroup = bookmarksTmp.find((group) => group.title === toGroup);
    const targetBookmarks = targetGroup?.bookmarks;
    const fromGroup = bookmarksTmp.find(
      (group) => group.title === fromGroupTitle,
    );
    const fromBookmarks = fromGroup?.bookmarks;
    if (!fromBookmarks || !targetBookmarks) {
      return;
    }
    const fromIndex = fromBookmarks.findIndex((bm) => bm.title === fromTitle);
    const toIndex = targetBookmarks.findIndex((bm) => bm.title === toTitle);
    const toInsert = fromBookmarks[fromIndex];
    fromBookmarks.splice(fromIndex, 1);
    targetBookmarks.splice(toIndex, 0, toInsert);
    targetGroup.bookmarks = targetBookmarks;
    // 如果 fromGroup 被清空，删除该组
    if (fromBookmarks.length === 0) {
      const fromIndex = bookmarksTmp.findIndex(
        (group) => group.title === fromGroupTitle,
      );
      bookmarksTmp.splice(fromIndex, 1);
    } else {
      fromGroup.bookmarks = fromBookmarks;
    }
    // TODO: 更新本地存储
    // 触发重新渲染
    setBookmarkGroups(bookmarksTmp);
  };

  return (
    <Collapse
      className="bookmark-collapse"
      ghost
      items={bookmarkGroups.map((group) => {
        // 每个 bookmarks 末尾添加一个元素，用于防止添加新书签
        const bookmarkCopy = group.bookmarks.slice();
        bookmarkCopy.push({
          title: 'InnerAddTo' + group.title,
          desc: '',
          action: '',
          avatar: ['fas', 'plus'],
          type: BookmarkType.ADD,
        });
        return {
          key: group.title,
          label: group.title,
          children: (
            <List
              className="bookmark-area"
              grid={{
                // 栅格间距
                gutter: 16,
                // 每行列数(<576px)
                xs: 1,
                // 每行列数(<768px)
                sm: 2,
                // 每行列数(<992px)
                md: 3,
                // 每行列数(<1200px)
                lg: 4,
                // 每行列数(<1600px)
                xl: 4,
                // 每行列数(1600px~)
                xxl: 4,
              }}
              dataSource={bookmarkCopy}
              renderItem={(bm) => {
                return (
                  <List.Item className="bookmark-item">
                    <Card
                      className={`bookmark-card bookmark-card-${bm.type.toLowerCase()}`}
                      hoverable={true}
                      draggable={bm.type !== BookmarkType.ADD}
                      onDrop={(event) =>
                        onDropCard(event, group.title, bm.title)
                      }
                      onDragStart={(event) =>
                        onDragCard(event, group.title, bm.title)
                      }
                      onDragOver={(event) => event.preventDefault()}
                      cover={
                        bm.type === BookmarkType.IMG ? (
                          <img src={bm.cover} />
                        ) : null
                      }
                    >
                      {bm.type !== BookmarkType.IMG ? (
                        <Card.Meta
                          key={bm.title}
                          title={bm.type !== BookmarkType.ADD ? bm.title : null}
                          description={bm.type !== BookmarkType.ADD ? bm.desc : null}
                          avatar={<FontAwesomeIcon icon={bm.avatar} />}
                        />
                      ) : null}
                    </Card>
                  </List.Item>
                );
              }}
            />
          ),
        };
      })}
    />
  );
};

export default BookmarksComponent;
