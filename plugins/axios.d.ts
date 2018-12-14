import { AxiosInstance } from "axios";
import VueI18n, { IVueI18n } from "vue-i18n";
import Vue from "vue";

declare module "axios" {
  export interface AxiosResponsePromise<T = void> extends AxiosPromise<T> {
    catch(callback: (e: AxiosError) => any);
  }

  export interface AxiosInstance {
    setToken(
      token: string,
      type: string,
      scopes?: "common" | "get" | "post" | "delete" | "put" | "patch" | string
    ): void;
    $request<T = any>(config: AxiosRequestConfig): AxiosResponsePromise<T>;
    $get<T = any>(url: string, config?: AxiosRequestConfig): AxiosResponsePromise<T>;
    $delete(url: string, config?: AxiosRequestConfig): AxiosResponsePromise;
    $head(url: string, config?: AxiosRequestConfig): AxiosResponsePromise;
    $post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosResponsePromise<T>;
    $put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosResponsePromise<T>;
    $patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): AxiosResponsePromise<T>;
  }
}
