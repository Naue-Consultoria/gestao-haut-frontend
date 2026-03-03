interface ToastProps {
  message: string;
  isVisible: boolean;
}

export function Toast({ message, isVisible }: ToastProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 right-8 px-6 py-4 bg-black text-white rounded-sm text-sm z-[2000] animate-toastIn">
      {message}
    </div>
  );
}
