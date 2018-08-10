import { AxiosInstance } from 'axios';
import VeoError from '~/models/VeoError';

declare module 'vue/types/vue' {
  // 3. Declare augmentation for Vue
  interface Vue {
    $error: typeof VeoError
  }
}
