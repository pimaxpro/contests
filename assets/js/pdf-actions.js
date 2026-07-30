/* =========================================================
   MODULE: PDF ACTIONS (FB SHARE, COPY LINK, DRIVE LINK)
========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  const btnShareFb = document.getElementById('btn-share-fb');
  const btnCopyLink = document.getElementById('btn-copy-link');
  const toastEl = document.getElementById('toast-message');
  const toastText = document.getElementById('toast-text');

  function showToast(msg) {
    if (toastEl && toastText) {
      toastText.textContent = msg;
      toastEl.classList.add('show');
      setTimeout(() => {
        toastEl.classList.remove('show');
      }, 2500);
    }
  }

  // 1. Chia sẻ Facebook
  if (btnShareFb) {
    btnShareFb.addEventListener('click', () => {
      const shareUrl = encodeURIComponent(window.location.href);
      const fbShareWindow = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
      window.open(fbShareWindow, '_blank', 'width=600,height=500');
    });
  }

  // 2. Sao chép Liên kết Bài thi
  if (btnCopyLink) {
    btnCopyLink.addEventListener('click', () => {
      const fullLink = window.location.href;
      navigator.clipboard.writeText(fullLink).then(() => {
        showToast('Đã chép liên kết bài thi vào bộ nhớ tạm!');
      }).catch(err => {
        console.error('Lỗi khi chép liên kết:', err);
      });
    });
  }
});
