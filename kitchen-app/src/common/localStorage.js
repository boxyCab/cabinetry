// localStorage.js

// 加载状态，根据 userId 来加载
export const loadState = (userId) => {
    try {
      const serializedState = localStorage.getItem(`reduxState_${userId}`);
      if (serializedState === null) {
        return undefined; // 没有找到状态
      }
      return JSON.parse(serializedState); // 返回解析后的状态
    } catch (err) {
      console.error('Error loading state', err);
      return undefined;
    }
  };
  
  // 保存状态，根据 userId 来保存
  export const saveState = (userId, state) => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem(`reduxState_${userId}`, serializedState);
    } catch (err) {
      console.error('Error saving state', err);
    }
  };
  