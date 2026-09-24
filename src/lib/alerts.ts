import Swal from 'sweetalert2';

export const showSuccessAlert = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'success',
    title: title,
    text: text || '',
    background: '#0f172a',
    color: '#f8fafc',
    iconColor: '#10b981',
    confirmButtonColor: '#0284c7',
    confirmButtonText: 'OK',
    customClass: {
      popup: 'rounded-2xl border border-slate-700 shadow-2xl font-sans',
      title: 'text-lg font-bold text-white',
      htmlContainer: 'text-sm text-slate-300',
      confirmButton: 'px-5 py-2.5 rounded-xl font-semibold text-xs shadow-md'
    }
  });
};

export const showErrorAlert = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'error',
    title: title,
    text: text || '',
    background: '#0f172a',
    color: '#f8fafc',
    iconColor: '#f43f5e',
    confirmButtonColor: '#e11d48',
    confirmButtonText: 'Close',
    customClass: {
      popup: 'rounded-2xl border border-slate-700 shadow-2xl font-sans',
      title: 'text-lg font-bold text-white',
      htmlContainer: 'text-sm text-slate-300',
      confirmButton: 'px-5 py-2.5 rounded-xl font-semibold text-xs shadow-md'
    }
  });
};

export const showInfoAlert = (title: string, text?: string) => {
  return Swal.fire({
    icon: 'info',
    title: title,
    text: text || '',
    background: '#0f172a',
    color: '#f8fafc',
    iconColor: '#38bdf8',
    confirmButtonColor: '#0284c7',
    confirmButtonText: 'OK',
    customClass: {
      popup: 'rounded-2xl border border-slate-700 shadow-2xl font-sans',
      title: 'text-lg font-bold text-white',
      htmlContainer: 'text-sm text-slate-300',
      confirmButton: 'px-5 py-2.5 rounded-xl font-semibold text-xs shadow-md'
    }
  });
};

export const showConfirmAlert = async (
  title: string,
  text?: string,
  confirmText: string = 'Yes, Delete'
): Promise<boolean> => {
  const result = await Swal.fire({
    icon: 'warning',
    title: title,
    text: text || '',
    showCancelButton: true,
    background: '#0f172a',
    color: '#f8fafc',
    iconColor: '#f59e0b',
    confirmButtonColor: '#e11d48',
    cancelButtonColor: '#475569',
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancel',
    customClass: {
      popup: 'rounded-2xl border border-slate-700 shadow-2xl font-sans',
      title: 'text-lg font-bold text-white',
      htmlContainer: 'text-sm text-slate-300',
      confirmButton: 'px-5 py-2.5 rounded-xl font-semibold text-xs shadow-md',
      cancelButton: 'px-5 py-2.5 rounded-xl font-semibold text-xs shadow-md'
    }
  });
  return result.isConfirmed;
};

export const showConfirmDeleteWithLoader = async (
  title: string,
  text: string,
  onDeleteAsync: () => Promise<void>,
  successTitle: string = 'Deleted Successfully',
  successText: string = 'The dependent has been removed from your beneficiaries.'
) => {
  const result = await Swal.fire({
    icon: 'warning',
    title: title,
    text: text,
    showCancelButton: true,
    confirmButtonText: 'Yes, Delete',
    cancelButtonText: 'Cancel',
    showLoaderOnConfirm: true,
    background: '#0f172a',
    color: '#f8fafc',
    iconColor: '#f59e0b',
    confirmButtonColor: '#e11d48',
    cancelButtonColor: '#475569',
    customClass: {
      popup: 'rounded-2xl border border-slate-700 shadow-2xl font-sans',
      title: 'text-lg font-bold text-white',
      htmlContainer: 'text-sm text-slate-300',
      confirmButton: 'px-5 py-2.5 rounded-xl font-semibold text-xs shadow-md min-w-[100px]',
      cancelButton: 'px-5 py-2.5 rounded-xl font-semibold text-xs shadow-md'
    },
    preConfirm: async () => {
      try {
        const btn = Swal.getConfirmButton();
        if (btn) btn.textContent = 'Deleting...';
        await onDeleteAsync();
        return true;
      } catch (error: any) {
        Swal.showValidationMessage(error.message || 'Failed to delete');
        return false;
      }
    },
    allowOutsideClick: () => !Swal.isLoading()
  });

  if (result.isConfirmed) {
    await Swal.fire({
      icon: 'success',
      title: successTitle,
      text: successText,
      timer: 2000,
      showConfirmButton: true,
      confirmButtonText: 'OK',
      background: '#0f172a',
      color: '#f8fafc',
      iconColor: '#10b981',
      confirmButtonColor: '#0284c7',
      customClass: {
        popup: 'rounded-2xl border border-slate-700 shadow-2xl font-sans',
        title: 'text-lg font-bold text-white',
        htmlContainer: 'text-sm text-slate-300',
        confirmButton: 'px-5 py-2.5 rounded-xl font-semibold text-xs shadow-md'
      }
    });
  }
};

