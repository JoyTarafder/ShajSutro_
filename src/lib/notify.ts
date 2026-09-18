import { toast, type ToastOptions } from "react-toastify";

const base: ToastOptions = { closeButton: true };
export const notifySuccess = (msg: string, opts?: ToastOptions) => toast.success(msg, { ...base, ...opts });
export const notifyError = (msg: string, opts?: ToastOptions) => toast.error(msg, { ...base, ...opts });
export const notifyInfo = (msg: string, opts?: ToastOptions) => toast.info(msg, { ...base, ...opts });
