import toast from 'react-hot-toast';
class Toast {
  private toastId: string;
  constructor(message: string) {
    this.toastId = toast.loading(message);
    return;
  }
  public error(message: string) {
    toast.error(message, {
      id: this.toastId,
    });
    return;
  }
  public success(message: string) {
    toast.success(message, {
      id: this.toastId,
    });
    return;
  }
  public loading(message: string) {
    toast.loading(message, {
      id: this.toastId,
    });
    return;
  }
  public dismiss() {
    toast.dismiss(this.toastId);
    return;
  }
}

export default Toast;
