import axios from 'axios';

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data && error.response.data.error) {
      const apiError = error.response.data.error;
      const message = typeof apiError === 'string' ? apiError : apiError.message;
      return Promise.reject(new Error(message || 'Ha ocurrido un error inesperado'));
    }
    return Promise.reject(error);
  }
);
