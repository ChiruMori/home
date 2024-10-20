import React, { useEffect, useState } from 'react';
import { Image } from 'antd';

import { useTheme } from '../ThemeProvider/ThemeContext';
import storage from '@/helper/localHolder';
import './index.less';

let globalInterval: NodeJS.Timeout | null = null;
let storageIndex = 0;
let globalPointer = 0;
let initImg = true;

const BgImg: React.FC = () => {
  const { theme } = useTheme();
  const [upUp, setUpUp] = useState(true);
  const [imgOpacity, setImgOpacity] = useState([1, 0]);
  const [hasImg, setHasImg] = useState(false);
  const [imgList, setImgList] = useState([] as string[]);

  const changeImg = function (indexToShow: number) {
    storage.get('bgImgList', (res: string[]) => {
      if (res && res.length === 1) {
        setImgList([res[0], res[0]]);
      } else if (res && res.length === 2) {
        setImgList([res[0], res[1]]);
      } else if (res) {
        storageIndex = (storageIndex + 1) % res.length;
        const newImgList = [...imgList];
        newImgList[indexToShow] = res[storageIndex];
        setImgList(newImgList);
      }
      if (res.length > 0) {
        setHasImg(res.length > 0);
      }
    });

    // 当前图片图层透明度 fade out 后下移
    const indexToFadeOut = 1 - indexToShow;
    const newOpacity = [] as number[];
    const step = 0.02;
    let stepCnt = ~~(1 / step) - 1;
    newOpacity[indexToShow] = 1;
    newOpacity[indexToFadeOut] = 1;
    // console.debug('changeImg', indexToShow, indexToFadeOut);
    const interval = setInterval(function () {
      newOpacity[indexToFadeOut] -= step;
      if (stepCnt-- === 0) {
        clearInterval(interval);
        newOpacity[indexToFadeOut] = 0;
        setUpUp(indexToFadeOut === 1);
        // console.debug('intervalNext', indexToFadeOut);
      }
      setImgOpacity([...newOpacity]);
      // console.debug('interval', newOpacity);
    }, 50);
  };

  // 通过定时器实现背景图片切换
  const resetInterval = function () {
    if (null === globalInterval) {
      globalInterval = setInterval(function () {
        // console.debug('resetInterval', globalPointer);
        globalPointer = 1 - globalPointer;
        changeImg(globalPointer);
        clearInterval(globalInterval!);
        globalInterval = null;
      }, 10000);
    }
  };
  useEffect(() => {
    if (initImg) {
      initImg = false;
      changeImg(0);
    }
    resetInterval();
  }, [imgList]);

  return (
    <div
      className="bg-img"
      style={{
        backgroundColor: theme.bgBase,
      }}
    >
      <div
        className="bg-img__overlay"
        style={{ backgroundColor: theme.bgBase, opacity: hasImg ? 0.75 : 1 }}
      />
      {hasImg ? (
        <div className="bg-img__img">
          <Image
            src={imgList[0]}
            style={{ zIndex: upUp ? -2 : -3, opacity: imgOpacity[0] }}
            alt="bg"
            preview={false}
          />
        </div>
      ) : null}
      {hasImg ? (
        <div className="bg-img__img">
          <Image
            src={imgList[1]}
            style={{ zIndex: !upUp ? -2 : -3, opacity: imgOpacity[1] }}
            alt="bg"
            preview={false}
          />
        </div>
      ) : null}
    </div>
  );
};

export default BgImg;
