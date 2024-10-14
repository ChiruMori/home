import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, List, Popconfirm, Typography, notification } from 'antd';

import U from '../../helper/utils';
import { BookmarkType, BookmarksGroup, Bookmark } from './types';
import BookmarkModal from './BookmarkModal';
import storage from '../../helper/localHolder';
import './Bookmarks.less';

const initBookmarks = [
  {
    title: 'Group1',
    bookmarks: [
      {
        title: 'Google',
        desc: 'Google Search',
        action: 'https://www.google.com',
        avatar: 'fab google',
        type: BookmarkType.URL,
      },
    ],
  },
] as BookmarksGroup[];

const BookmarksComponent: React.FC<{
  editMode: boolean;
}> = ({ editMode }) => {
  const [bookmarkGroups, setBookmarkGroups] = useState(initBookmarks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBookmark, setCurrentBookmark] = useState<Bookmark>();
  const [currentGroup, setCurrentGroup] = useState<string>('');
  const addBtnTitlePrefix = 'InnerAddTo:';
  // 从本地存储中读取书签数据
  useEffect(() => {
    const fetchBookmarks = async () => {
      storage.getAsync('bookmarks').then((data) => {
        data && setBookmarkGroups(data as BookmarksGroup[]);
      });
    };
    fetchBookmarks();
  }, initBookmarks);

  // 拖拽的哪个卡片
  const onDragCard = (
    event: React.DragEvent<HTMLDivElement>,
    fromGroup: string,
    fromTitle: string,
  ) => {
    if (!editMode) {
      return;
    }
    event.dataTransfer.setData('fromGrp', fromGroup);
    event.dataTransfer.setData('from', fromTitle);
  };
  // 拖拽到哪个卡片
  const onDropCard = (
    event: React.DragEvent<HTMLDivElement>,
    toGroup: string,
    toTitle: string,
  ) => {
    if (!editMode) {
      return;
    }
    event.preventDefault();
    const fromGroupTitle = event.dataTransfer.getData('fromGrp');
    const fromTitle = event.dataTransfer.getData('from');
    // 更新顺序，将当前书签插入到指定位置
    const bookmarksTmp = bookmarkGroups.slice();
    let targetGroup = bookmarksTmp.find((group) => group.title === toGroup);
    if (!targetGroup) {
      targetGroup = {
        title: toGroup,
        bookmarks: [],
      };
      bookmarksTmp.push(targetGroup);
    }
    const targetBookmarks = targetGroup!.bookmarks;
    const fromGroup = bookmarksTmp.find(
      (group) => group.title === fromGroupTitle,
    );
    const fromBookmarks = fromGroup?.bookmarks;
    if (!fromBookmarks || !targetBookmarks) {
      return;
    }
    const fromIndex = fromBookmarks.findIndex((bm) => bm.title === fromTitle);
    let toIndex = targetBookmarks.findIndex((bm) => bm.title === toTitle);
    const toInsert = fromBookmarks[fromIndex];
    fromBookmarks.splice(fromIndex, 1);
    if (toIndex === -1 && toTitle.startsWith(addBtnTitlePrefix)) {
      // 添加到末尾
      targetBookmarks.push(toInsert);
    } else {
      targetBookmarks.splice(toIndex, 0, toInsert);
    }
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
    // 更新本地存储
    storage.setAsync('bookmarks', bookmarksTmp);
    // 触发重新渲染
    setBookmarkGroups(bookmarksTmp);
  };

  // 表单
  const handleOk = (values: Bookmark, initTitle?: string) => {
    if (!editMode) {
      return;
    }
    const bookmarksTmp = bookmarkGroups.slice();
    let targetGroup = bookmarksTmp.find(
      (group) => group.title === currentGroup,
    );
    // 新建组
    if (!targetGroup) {
      targetGroup = {
        title: currentGroup,
        bookmarks: [],
      };
      bookmarksTmp.push(targetGroup);
    }
    const targetBookmarks = targetGroup!.bookmarks;
    if (!targetBookmarks) {
      return;
    }
    const toInsert = {
      title: values.title,
      desc: values.desc,
      action: values.action,
      avatar: values.avatar,
      type: values.type,
      cover: values.cover,
    };
    // 修改或新增
    const toUpdateIndex = targetBookmarks.findIndex(
      (bm) => bm.title === initTitle,
    );
    // 校验，不能与其他书签重名
    if (initTitle !== values.title) {
      if (targetBookmarks.find((bm) => bm.title === values.title)) {
        notification.error({
          message: '标题重复',
          description: '新标题与已有的书签标题重复，请修改后重试！',
        });
        return;
      }
    }
    if (toUpdateIndex !== -1) {
      targetBookmarks[toUpdateIndex] = toInsert;
    } else {
      targetBookmarks.push(toInsert);
    }
    targetGroup.bookmarks = targetBookmarks;
    // 更新本地存储
    storage.setAsync('bookmarks', bookmarksTmp);
    // 触发重新渲染
    setBookmarkGroups(bookmarksTmp);
    // 关闭弹窗
    setIsModalOpen(false);
  };
  const handleDelete = (grp: string, title: string) => {
    if (!editMode) {
      return;
    }
    // 删除指定书签
    const bookmarksTmp = bookmarkGroups.slice();
    const targetGroup = bookmarksTmp.find((group) => group.title === grp);
    const targetBookmarks = targetGroup?.bookmarks;
    if (!targetBookmarks) {
      return;
    }
    const toDeleteIndex = targetBookmarks.findIndex((bm) => bm.title === title);
    targetBookmarks.splice(toDeleteIndex, 1);
    targetGroup.bookmarks = targetBookmarks;
    // 目标组被清空，删除该组
    if (targetBookmarks.length === 0) {
      const targetIndex = bookmarksTmp.findIndex(
        (group) => group.title === grp,
      );
      bookmarksTmp.splice(targetIndex, 1);
    }
    // 更新本地存储
    storage.setAsync('bookmarks', bookmarksTmp);
    // 触发重新渲染
    setBookmarkGroups(bookmarksTmp);
    // 关闭弹窗
    setIsModalOpen(false);
  };
  const editGroupTitle = (oldTitle: string, newTitle: string) => {
    if (!editMode) {
      return;
    }
    const bookmarksTmp = bookmarkGroups.slice();
    const targetGroup = bookmarksTmp.find((group) => group.title === oldTitle);
    if (!targetGroup) {
      return;
    }
    targetGroup.title = newTitle;
    // 更新本地存储
    storage.setAsync('bookmarks', bookmarksTmp);
    // 触发重新渲染
    setBookmarkGroups(bookmarksTmp);
  };
  const removeGroup = (title: string) => {
    if (!editMode) {
      return;
    }
    const bookmarksTmp = bookmarkGroups.slice();
    const targetIndex = bookmarksTmp.findIndex(
      (group) => group.title === title,
    );
    bookmarksTmp.splice(targetIndex, 1);
    // 更新本地存储
    storage.setAsync('bookmarks', bookmarksTmp);
    // 触发重新渲染
    setBookmarkGroups(bookmarksTmp);
  };
  const showModal = (group: string, init?: Bookmark) => {
    if (!editMode) {
      return;
    }
    setCurrentGroup(group);
    setCurrentBookmark(init);
    setIsModalOpen(true);
  };
  // 生成新组名
  const generateGroupName = (i: number = 1): string => {
    const thisTry = `Group${i}`;
    if (bookmarkGroups.find((group) => group.title === thisTry)) {
      return generateGroupName(i + 1);
    }
    return thisTry;
  };

  return (
    <>
      <div className="bookmark-wrapper">
        {...bookmarkGroups.map((group) => {
          let bookmarkCopy = group.bookmarks;
          // 编辑模式下，为每个 bookmarks 末尾添加一个元素，用于防止添加新书签
          if (editMode) {
            bookmarkCopy = group.bookmarks.slice();
            bookmarkCopy.push({
              title: addBtnTitlePrefix + group.title,
              desc: '',
              action: '',
              avatar: 'fas plus',
              type: BookmarkType.ADD,
            });
          }
          return (
            <>
              <Typography.Title
                level={4}
                editable={
                  editMode
                    ? {
                        icon: <FontAwesomeIcon icon={['fas', 'edit']} />,
                        tooltip: '点击编辑标题',
                        text: group.title,
                        enterIcon: <FontAwesomeIcon icon={['fas', 'check']} />,
                        onChange: (newTitle) =>
                          editGroupTitle(group.title, newTitle),
                      }
                    : false
                }
              >
                {group.title}
                {/* 删除按钮 */}
                {editMode ? (
                  <Popconfirm
                    title="确认删除该组吗？"
                    onConfirm={() => removeGroup(group.title)}
                    okText="确认"
                    cancelText="取消"
                  >
                    <button className="ant-typography-edit">
                      <FontAwesomeIcon
                        icon={['far', 'minus-square']}
                        className="group-minus-icon"
                      />
                    </button>
                  </Popconfirm>
                ) : null}
              </Typography.Title>
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
                        draggable={editMode && bm.type !== BookmarkType.ADD}
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
                        onClick={() => {
                          if (bm.type === BookmarkType.ADD) {
                            showModal(group.title);
                          } else if (editMode) {
                            showModal(group.title, bm);
                          } else {
                            // 新标签页打开指定的 action 链接
                            window.open(bm.action, '_blank');
                          }
                        }}
                      >
                        {bm.type !== BookmarkType.IMG ? (
                          <Card.Meta
                            key={bm.title}
                            title={
                              bm.type !== BookmarkType.ADD ? bm.title : null
                            }
                            description={
                              bm.type !== BookmarkType.ADD ? bm.desc : null
                            }
                            avatar={
                              <FontAwesomeIcon icon={U.strToIcon(bm.avatar)} />
                            }
                          />
                        ) : null}
                      </Card>
                    </List.Item>
                  );
                }}
              />
            </>
          );
        })}
        <Card
          hidden={!editMode}
          className="bookmark-add-grp bookmark-card-add"
          hoverable={true}
          onDrop={(event) => onDropCard(event, generateGroupName(), 'add')}
          onDragOver={(event) => event.preventDefault()}
          onClick={() => {
            if (editMode) {
              showModal(generateGroupName());
            }
          }}
        >
          <Card.Meta
            key={'new-group'}
            avatar={<FontAwesomeIcon icon={['fas', 'plus']} />}
          />
        </Card>
      </div>
      <BookmarkModal
        visible={isModalOpen}
        editMode={!!currentBookmark}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        onDelete={() => {
          if (currentBookmark) {
            handleDelete(currentGroup, currentBookmark.title);
          }
        }}
        form={currentBookmark}
      />
    </>
  );
};

export default BookmarksComponent;
