// src/api/postData.js
import axios from 'axios';

const postData = async (data) => {
  try {
    // 根据当前环境创建基础 URL
    const baseURL = window.location.hostname === 'localhost' 
      ? 'http://localhost' 
      : `http://${window.location.hostname}`;
    
    const response = await axios.post(`${baseURL}/api/postKitObj`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // 如果后端配置了 credentials
    });
    console.log(response.data);
    return response.data; // 成功时返回响应数据
  } catch (error) {
    console.error('Error posting data:', error);
    // 返回一个包含错误信息的对象
    return { error: error.response ? error.response.data : 'Unknown error occurred' };
  }
};

// 调用函数并传递输入参数
// postData({ name: 'Trent', age: 30 }).then(result => console.log(result));

export default postData;
