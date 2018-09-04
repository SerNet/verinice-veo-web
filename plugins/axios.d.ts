import { AxiosInstance } from "axios";
import VueI18n, { IVueI18n } from "vue-i18n";
import Vue from "vue";

declare module "axios" {
  export interface AxiosInstance {
    setToken(
      token: string,
      type: string,
      scopes?: "common" | "get" | "post" | "delete" | "put" | "patch" | string
    ): void;

    $request<T = any>(config: AxiosRequestConfig): Promise<T>;
    $get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T>;
    $delete(url: string, config?: AxiosRequestConfig): Promise<void>;
    $head(url: string, config?: AxiosRequestConfig): Promise<void>;
    $post<T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<T>;
    $put<T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<T>;
    $patch<T = any>(
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<T>;
  }
}
