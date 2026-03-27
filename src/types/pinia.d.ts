import 'pinia'
import { useAuthStore } from '../store/auth'

declare module 'pinia' {
  export interface PiniaCustomProperties {
    $id: string
  }
}
