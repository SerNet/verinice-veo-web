import {AxiosInstance} from 'axios';

declare module 'vue/types/vue' {
  // 3. Declare augmentation for Vue
  interface Vue {
    $axios: AxiosInstance
  }
}

declare module 'axios' {
  export interface AxiosInstance {
    $request<T = any>(config: AxiosRequestConfig): Promise<T>;
    $get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    $delete(url: string, config?: AxiosRequestConfig): Promise<void>;
    $head(url: string, config?: AxiosRequestConfig): Promise<void>;
    $post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    $put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
    $patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  }
}