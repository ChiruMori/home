import React, { useEffect, useState } from 'react';
import { Carousel, Image } from 'antd';

import { useTheme } from '../ThemeProvider/ThemeContext';
import storage from '@/helper/localHolder';
import './index.less';

const BgImgCarousel: React.FC = () => {
  const { theme } = useTheme();
  const [bgImgs, setBgImgs] = useState<string[]>([]);

  useEffect(() => {
    storage.getAsync('bgImgList').then((data) => {
      if (data) {
        setBgImgs(data as string[]);
      }
    });
  }, []);

  return (
    <div
      className="bg-img"
      style={{
        background: theme.bgBase,
      }}
    >
      <Carousel
        autoplay
        autoplaySpeed={10000}
        speed={1000}
        effect="fade"
        dots={false}
        style={{
          background: theme.bgBase,
        }}
      >
        {bgImgs.map((bgImg) => (
          <div key={bgImg}>
            <div className="bg-img__img">
              <Image src={bgImg} alt="bg" preview={false} />
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default BgImgCarousel;
