import { toast } from 'vue-sonner'

export function useToast() {
  return {
    success: (msg: string) => toast.success(msg),
    error: (msg: string) => toast.error(msg),
    info: (msg: string) => toast.info(msg),
    warning: (msg: string) => toast.warning(msg),
    promise: <T>(
      promise: Promise<T>,
      msgs: { loading: string; success: string; error: string }
    ) => toast.promise(promise, msgs)
  }
}
