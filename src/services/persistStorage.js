// redux-persist storage adapter compatible with Vite's ESM interop.
const memory = new Map();

const getStore = () => (typeof window !== "undefined" && window.localStorage ? window.localStorage : null);

const storage = {
  getItem: (key) => Promise.resolve(getStore()?.getItem(key) ?? memory.get(key) ?? null),
  setItem: (key, value) => {
    getStore()?.setItem(key, value);
    memory.set(key, value);
    return Promise.resolve();
  },
  removeItem: (key) => {
    getStore()?.removeItem(key);
    memory.delete(key);
    return Promise.resolve();
  },
};

export default storage;
