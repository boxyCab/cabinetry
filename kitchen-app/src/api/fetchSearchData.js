// src/api/fetchSearchData.js
import axios from 'axios';

const fetchSearchData = async (searchData) => {
  try {
    // 根据当前环境创建基础 URL
    const baseURL = window.location.hostname === 'localhost' 
      ? 'http://localhost' 
      : `http://${window.location.hostname}`;
    // const baseURL = '/api';
    const response = await axios.get(`${baseURL}/api/searchKitchenInfo`, {
        params: {
            searchData: searchData,
          },
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true, // 如果后端配置了 credentials
        });
    console.log(response.data); // 处理返回的数据
    return response.data; // 成功时返回响应数据
  } catch (error) {
    console.error('Error fetching data:', error);
    // 返回一个包含错误信息的对象
    return { error: error.response ? error.response.data : 'Unknown error occurred' };
  }
};

//fetchData();
export default fetchSearchData;