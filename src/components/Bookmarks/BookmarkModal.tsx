import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button, Popconfirm } from 'antd';
import { Bookmark, BookmarkType } from './types';
import IconPicker from './IconPicker';

interface BookmarkModalProps {
  visible: boolean;
  editMode: boolean;
  onOk: (values: Bookmark, initTitle?: string) => void;
  onCancel: () => void;
  onDelete?: () => void;
  form?: Bookmark;
}

const BookmarkModal: React.FC<BookmarkModalProps> = ({
  visible,
  editMode,
  onOk,
  onCancel,
  onDelete,
  form,
}) => {
  const [bookmarkForm] = Form.useForm<Bookmark>();
  const [coverHidden, setCoverHidden] = React.useState(true);
  useEffect(() => {
    if (visible) {
      bookmarkForm.setFieldsValue(form ?? {});
      if (!form) {
        bookmarkForm.resetFields();
      }
    }
    setCoverHidden(form?.type === BookmarkType.URL);
  }, [form, visible, bookmarkForm]);
  const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 },
  };

  return (
    <Modal
      title={editMode ? '编辑书签' : '新建书签'}
      open={visible}
      onOk={() => {
        bookmarkForm.validateFields().then((val) => onOk(val, form?.title));
      }}
      onCancel={onCancel}
      footer={[
        editMode ? (
          <Popconfirm
            title="确认删除该书签吗？"
            onConfirm={onDelete}
            okText="确认"
            cancelText="取消"
            key="delete"
          >
            <Button type="dashed" danger>
              删除
            </Button>
          </Popconfirm>
        ) : null,
        <Button
          key="submit"
          type="primary"
          onClick={() => {
            bookmarkForm.validateFields().then((val) => onOk(val, form?.title));
          }}
        >
          确定
        </Button>,
      ]}
    >
      <Form {...layout} form={bookmarkForm}>
        <Form.Item name="title" label="标题" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="desc" label="描述" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="action" label="URL" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="type" label="类型" rules={[{ required: true }]}>
          <Select onSelect={(val) => setCoverHidden(val === BookmarkType.URL)}>
            <Select.Option value={BookmarkType.URL}>常规</Select.Option>
            <Select.Option value={BookmarkType.IMG}>贴图</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="cover" label="图片链接" hidden={coverHidden}>
          <Input />
        </Form.Item>
        <Form.Item name="avatar" label="图标" hidden={!coverHidden}>
          <IconPicker showSearch placeholder="未选择图标" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BookmarkModal;
