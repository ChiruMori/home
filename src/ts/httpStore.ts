// *********************
// Http 请求与存储
// *********************
import storage from './storage';
import common from './common';

const server_prefix = 'http://localhost:3000/api/v1/';

/**
 * 开发调试使用的数据
 */
const debugApiData: any = {
    'k': 'v',
}

/**
 * 发送一个 HTTP 请求
 * 
 * @param url 请求地址
 * 
 */
const doRequest = function (url: string, method?: string, options?: object): Promise<any> {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: server_prefix + url,
            method: method || 'GET',
            data: options,
            success: function (data) {
                resolve(data);
            },
            error: function (err) {
                reject(err);
            }
        });
    });
};

/**
 * 捆绑的 API 请求
 */
class BundleApi {

    static #apiMap = new Map<string, BundleApi>();

    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    /**
     * 缓存中使用的键
     */
    key: string;

    constructor(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', key?: string) {
        this.url = url;
        this.method = method;
        this.key = key ? key : Buffer.from(this.url + this.method).toString('base64');
    }

    /**
     * 如果缓存中存在则直接返回（忽略 options）
     * 缓存不存在或过期时，执行请求并存储结果
     */
    getData(options?: object): Promise<any> {
        if (common.config.debugMode) {
            return Promise.resolve(debugApiData[this.key]);
        }
        let that = this;
        return new Promise(async (resolve, reject) => {
            const data = storage.getData(that.key);
            if (data) {
                resolve(data);
            } else {
                const res = await doRequest(that.url, that.method, options);
                storage.setData(that.key, res);
                resolve(res);
            }
        });
    }
}

export = {

}