import localforage from 'localforage';

const set = (key: string, value: any, fb: () => void) => {
  localforage.setItem(key, value).then(fb);
};

const setAsync = async (key: string, value: any) => {
  await localforage.setItem(key, value);
};

const get = (key: string, fb: (value: any) => void) => {
  localforage.getItem(key).then((value) => fb(value));
};

const getAsync = async (key: string) => {
  return await localforage.getItem(key);
};

const exportAll = () =>
  new Promise((resolve, reject) => {
    // 使用 Json 格式导出所有数据
    const data = {} as { [key: string]: any };
    localforage.iterate(
      (value, key) => {
        data[key] = value;
      },
      (err) => {
        if (err) {
          reject(err);
        } else {
          // 处理特殊字符并编码
          const dataJson = JSON.stringify(data);
          const dataString = encodeURIComponent(dataJson);
          const base64Data = btoa(dataString);
          resolve(base64Data);
        }
      },
    );
  });

const importAll = (dataString: string) => {
  // 解码
  const data = JSON.parse(decodeURIComponent(atob(dataString)));
  // 导入
  const importPromise = Object.entries(data).map(([key, value]) =>
    localforage.setItem(key, value),
  );
  // 刷新页面
  Promise.all(importPromise).then(() => {
    window.location.reload();
  });
};

export default { set, get, setAsync, getAsync, exportAll, importAll };
