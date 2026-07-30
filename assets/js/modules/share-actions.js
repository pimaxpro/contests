/* =========================================================
   MODULE 3: SIDEBAR SHARE ACTIONS (FB SHARE, COPY LINK)
========================================================= */

window.ShareActionsModule = {
  showToast(msg) {
    const toastEl = document.getElementById('toast-message');
    const toastText = document.getElementById('toast-text');
    if (toastEl && toastText) {
      toastText.textContent = msg;
      toastEl.classList.add('show');
      setTimeout(() => {
        toastEl.classList.remove('show');
      }, 2500);
    }
  },

  init() {
    const btnShareFb = document.getElementById('btn-share-fb');
    const btnCopyLink = document.getElementById('btn-copy-link');

    if (btnShareFb) {
      btnShareFb.addEventListener('click', () => {
        const shareUrl = encodeURIComponent(window.location.href);
        const fbShareWindow = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        window.open(fbShareWindow, '_blank', 'width=600,height=500');
      });
    }

    if (btnCopyLink) {
      btnCopyLink.addEventListener('click', () => {
        const fullLink = window.location.href;
        navigator.clipboard.writeText(fullLink).then(() => {
          this.showToast('Đã chép liên kết bài thi vào bộ nhớ tạm!');
        }).catch(err => {
          console.error('Lỗi khi chép liên kết:', err);
        });
      });
    }
  }
};
