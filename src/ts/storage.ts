/**
 * 对原有缓存方法做了简单的封装，提供备份恢复等功能
 * 改造自 storage.js
 * 最后修改于：2022.06.29，拓展数据过期功能
 * 
 * @author Chiru
 */

/**
 * 本地存储实际存储的元素
 */
class StorageElement {

  /**
   * @param {string} key 键名
   */
  private key: string;

  /**
   * @param {string} value 值
   */
  private value: string;

  /**
   * @param {number} deadline 过期时间（戳）
   */
  private deadline: number;

  constructor(key: string, value: string, deadline: number) {
    this.key = key;
    this.value = value;
    this.deadline = deadline;
  }

  /**
   * 
   * @returns 值的字符串表示
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 判断当前对象是否过期，deadline 小于 0 则永不过期
   */
  overdue(): boolean {
    if (!this.deadline) {
      return true;
    }
    return this.deadline > 0 && new Date().getTime() > this.deadline;
  }

  /**
   * 将当前对象编码为字符串
   * 
   * @returns 当前对象编码后得到的字符串
   */
  toString(): string {
    let strContent = JSON.stringify(this);
    return StorageElement.#encode(strContent);
  }

  /**
   * 将编码后的字符串解码为对象
   * 
   * @param str 编码后的字符串
   * @returns 解码得到的对象
   */
  static fromString(str: string): StorageElement {
    let strContent = StorageElement.#decode(str);
    let obj = JSON.parse(strContent);
    return new StorageElement(obj.key, obj.value, obj.deadline);
  }

  /**
   * 通过 base64 对存储内容进行编码
   */
  static #encode(value: string): string {
    // 中文编码
    value = encodeURIComponent(value);
    // base64 编码
    return btoa(value);
  }

  /**
   * 解码 base64 编码的存储内容
   */
  static #decode(value: string): string {
    // base64 解码
    value = atob(value);
    // 中文解码
    value = decodeURIComponent(value);
    return value;
  }
}

/**
 * 本地存储工具接口
 */
interface StorageTool {
  /**
   * 内部使用的存储对象
   */
  _storage: Storage;

  /**
   * 向存储中插入一条数据
   * 
   * @param key 键名
   * @param value 值，会被转换为字符串并编码后存储
   * @param deadline 过期时间（戳）
   */
  setData: (key: string, value: any, timeout?: number) => void;

  /**
   * 从存储中获取一条数据，不存在或过期则返回 null
   * 
   * @param key 键名
   * @returns 值，解码后的原始内容
   */
  getData: (key: string) => any;

  /**
   * 从存储中删除并返回一条数据
   * 
   * @returns 被干掉的值，解码后的原始内容
   */
  removeData: (key: string) => any;

  /**
   * 清空存储中的所有数据
   */
  clearData: () => void;

  /**
   * 获取存储中的所有数据的副本
   */
  getAllCopy: () => Map<string, any>;

  /**
   * 获取存储中的所有数据的副本，并以回调方法的第一个字符串参数形式返回
   */
  backup: (fn: (str: string) => void) => void;

  /**
   * 通过备份得到的字符串还原存储中的数据
   */
  recover: (str: string) => void;
}

const dataManager: StorageTool = {
  _storage: window.localStorage,

  setData(key: string, value: any, timeout: number = -1): void {
    let deadline: number = new Date().getTime() + timeout;
    // 设置有效时间，为 -1 时永久有效
    if (timeout === -1) {
      deadline = -1;
    }
    let storageElement = new StorageElement(key, JSON.stringify(value), deadline);
    this._storage.setItem(key, storageElement.toString());
  },

  getData(key: string): any {
    let str = this._storage.getItem(key);
    if (!str) {
      return null;
    }
    let storageElement = StorageElement.fromString(str);
    if (storageElement.overdue()) {
      this.removeData(key);
      return null;
    }
    return JSON.parse(storageElement.getValue());
  },

  removeData(key: string): any {
    let str = this._storage.getItem(key);
    if (!str) {
      return null;
    }
    let storageElement = StorageElement.fromString(str);
    this._storage.removeItem(key);
    return JSON.parse(storageElement.getValue());
  },

  clearData(): void {
    this._storage.clear();
  },

  getAllCopy(): Map<string, any> {
    let map = new Map<string, any>();
    for (let i = 0; i < this._storage.length; i++) {
      let key: string = this._storage.key(i)!;
      let value = this.getData(key);
      map.set(key, value);
    }
    return map;
  },

  backup(fn: (str: string) => void): void {
    let str = JSON.stringify(this.getAllCopy());
    fn(str);
  },

  recover(str: string): void {
    let map = JSON.parse(str);
    for (let [key, value] of map) {
      this.setData(key, value);
    }
  }
}

export = dataManager;