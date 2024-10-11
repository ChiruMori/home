import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Card,
  List,
  Modal,
  Form,
  Input,
  Select,
  Button,
  Popconfirm,
  Typography,
} from 'antd';
import { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';

import './Bookmarks.less';
import IconPicker from './IconPicker';
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

const BookmarksComponent: React.FC<{
  editMode: boolean;
}> = ({ editMode }) => {
  const [bookmarkGroups, setBookmarkGroups] = useState(initBookmarks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addBtnTitlePrefix = 'InnerAddTo:';

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
    // TODO: 更新本地存储
    // 触发重新渲染
    setBookmarkGroups(bookmarksTmp);
  };

  // 表单
  const [bookmarkForm] = Form.useForm();
  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 },
  };
  const handleOk = () => {
    if (!editMode) {
      return;
    }
    console.log(bookmarkForm.getFieldsValue());
    const values = bookmarkForm.getFieldsValue();
    const bookmarksTmp = bookmarkGroups.slice();
    const targetGroup = bookmarksTmp.find(
      (group) => group.title === values.group,
    );
    const targetBookmarks = targetGroup?.bookmarks;
    if (!targetBookmarks) {
      return;
    }
    const toInsert = {
      title: values.title,
      desc: values.desc,
      action: values.action,
      avatar: values.avatar.split(' '),
      type: values.type,
      cover: values.cover,
    };
    targetBookmarks.push(toInsert);
    targetGroup.bookmarks = targetBookmarks;
    // TODO: 更新本地存储
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
    // TODO: 更新本地存储
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
    // TODO: 更新本地存储
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
    // TODO: 更新本地存储
    // 触发重新渲染
    setBookmarkGroups(bookmarksTmp);
  };
  const [editModal, setEditModal] = useState(true);
  const [coverHidden, setCoverHidden] = useState(true);
  const showModal = (group: string, init?: Bookmark) => {
    if (!editMode) {
      return;
    }
    setIsModalOpen(true);
    bookmarkForm.resetFields();
    bookmarkForm.setFieldsValue({
      group: group,
      title: init?.title,
      desc: init?.desc,
      action: init?.action,
      avatar: init?.avatar.join(' '),
      type: init?.type,
      cover: init?.cover,
    });
    // init 为空，需要隐藏删除按钮
    setEditModal(init !== undefined);
    // 如果是图片类型，显示图片链接
    setCoverHidden(init?.type !== BookmarkType.IMG);
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
              avatar: ['fas', 'plus'],
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
                            avatar={<FontAwesomeIcon icon={bm.avatar} />}
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
      </div>
      <Modal
        title={editModal ? '编辑' : '新建' + '书签'}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          editModal ? (
            <Popconfirm
              key="delete"
              title="确认删除该书签吗？"
              onConfirm={() =>
                handleDelete(
                  bookmarkForm.getFieldValue('group'),
                  bookmarkForm.getFieldValue('title'),
                )
              }
              okText="确认"
              cancelText="取消"
            >
              <Button key="delete" type="dashed" danger>
                删除
              </Button>
            </Popconfirm>
          ) : null,
          <Button key="submit" type="primary" onClick={handleOk}>
            确定
          </Button>,
        ]}
      >
        <Form {...layout} form={bookmarkForm} name="bookmark-edit-form">
          <Form.Item name="group" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input disabled={editModal} />
          </Form.Item>
          <Form.Item name="desc" label="描述" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="action" label="URL" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select
              onSelect={(val) => {
                setCoverHidden(val === BookmarkType.URL);
              }}
            >
              <Select.Option value={BookmarkType.URL}>常规</Select.Option>
              <Select.Option value={BookmarkType.IMG}>贴图</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="cover"
            label="图片链接"
            rules={[{ required: true }]}
            hidden={coverHidden}
          >
            <Input />
          </Form.Item>
          <Form.Item name="avatar" label="图标" rules={[{ required: true }]}>
            {/* FIXME: 报错呢 */}
            <IconPicker
              value={bookmarkForm.getFieldValue('avatar')}
              onSelect={(val) => {
                console.log(val);
                bookmarkForm.setFieldsValue({ avatar: val.join(' ') });
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default BookmarksComponent;
