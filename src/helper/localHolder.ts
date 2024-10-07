import localforage from 'localforage';

const set = (key: string, value: any, fb: () => void) => {
  localforage.setItem(key, value).then(fb);
};

const setAsyn = async (key: string, value: any) => {
    await localforage.setItem(key, value);
}

const get = (key: string, fb: (value: any) => void) => {
   localforage.getItem(key).then((value) => fb(value));
};

const getAsyn = async (key: string) => {
    return await localforage.getItem(key);
}

const exportAll = () => {
    // 使用 Json 格式导出所有数据
    const data = {} as { [key: string]: any };
    localforage.iterate((value, key) => {
        data[key] = value;
    });
    // 转为字符串
    const dataString = JSON.stringify(data);
    // 简单编码
    return btoa(dataString);
}

const importAll = (dataString: string) => {
    // 解码
    const data = JSON.parse(atob(dataString));
    // 导入
    Object.entries(data).forEach(([key, value]) => {
        localforage.setItem(key, value);
    });
    // 刷新页面
    window.location.reload();
}

export default { set, get, setAsyn, getAsyn, exportAll, importAll };
