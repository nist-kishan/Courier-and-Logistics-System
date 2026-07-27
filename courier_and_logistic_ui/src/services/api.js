const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = {
  isMockMode: () => false,
  setMode: () => {},
  
  request: async (url, options = {}) => {
    try {
      const response = await fetch(`${BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options,
        body: options.body ? JSON.stringify(options.body) : undefined
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Request failed with status ${response.status}`);
      }
      
      const resData = await response.json();
      return resData.data; // Spring Boot API wraps payload inside ResponseStructure.data
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};
