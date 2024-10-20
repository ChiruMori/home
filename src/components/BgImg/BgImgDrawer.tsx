import React, { useState } from 'react';
import {
  Modal,
  Image,
  Button,
  Drawer,
  Card,
  Input,
  App,
  Row,
  Col,
  Badge,
  Popconfirm,
} from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import storage from '@/helper/localHolder';
import { useTheme } from '@/components/ThemeProvider/ThemeContext';

interface BgImgDrawerProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

const BgImgDrawer: React.FC<BgImgDrawerProps> = ({ visible, setVisible }) => {
  const [imgList, setImgList] = useState([] as string[]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [imgUrl, setImgUrl] = useState('');
  // 具有上下文的 notificaiton
  const { notification } = App.useApp();
  const { theme } = useTheme();

  React.useEffect(() => {
    storage.get('bgImgList', (res: string[]) => {
      setImgList(res);
    });
  }, []);

  const addImg = (newUrl: string) => {
    if (imgList?.includes(newUrl)) {
      notification.error({
        message: '图片已存在',
      });
      return;
    }
    const newImgs = [];
    if (imgList !== null) {
      newImgs.push(...imgList);
    }
    newImgs.push(newUrl);
    storage.setAsync('bgImgList', newImgs);
    setImgList(newImgs);
  };

  const removeImg = (index: number) => {
    const newList = imgList.filter((_, idx) => idx !== index);
    setImgList(newList);
    storage.setAsync('bgImgList', newList);
  };

  return (
    <Drawer
      title="设置背景图片"
      open={visible}
      onClose={() => setVisible(false)}
      width={400}
    >
      {/* 可以增加、删除图片，支持图片预览 */}
      <Row gutter={[16, 16]}>
        {imgList?.map((img, index) => (
          <Col key={index} span={8}>
            <Badge
              count={
                <Popconfirm
                  title="确定删除图片?"
                  onConfirm={() => removeImg(index)}
                  okText="确定"
                  cancelText="取消"
                >
                  <FontAwesomeIcon
                    icon={['fas', 'circle-xmark']}
                    style={{
                      cursor: 'pointer',
                      color: theme.error,
                      fontSize: '24px',
                    }}
                  />
                </Popconfirm>
              }
            >
              <Image
                key={index}
                width={100}
                height={100}
                style={{ cursor: 'pointer', objectFit: 'cover' }}
                src={img}
                preview={{
                  mask: <div style={{ color: 'white' }}>预览</div>,
                }}
              />
            </Badge>
          </Col>
        ))}
        <Col span={8}>
          <Card
            style={{
              cursor: 'pointer',
              textAlign: 'center',
              width: '100px',
              height: '100px',
              alignContent: 'center',
              fontSize: '24px',
              color: theme.primary,
              border: '1px dashed ' + theme.primary,
            }}
            onClick={() => {
              setImgUrl('');
              setModalVisible(true);
            }}
          >
            <FontAwesomeIcon icon={['fas', 'plus']} />
          </Card>
        </Col>
      </Row>
      <Modal
        title="增加图片"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            取消
          </Button>,
          <Button
            key="ok"
            type="primary"
            onClick={() => {
              addImg(imgUrl);
              setModalVisible(false);
            }}
          >
            确定
          </Button>,
        ]}
      >
        <Input
          placeholder="请输入图片地址"
          value={imgUrl}
          onChange={(e) => setImgUrl(e.target.value)}
        />
      </Modal>
    </Drawer>
  );
};

export default BgImgDrawer;
