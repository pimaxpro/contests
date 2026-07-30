/* =========================================================
   MODULE: SHARED UI COMPONENTS (FOOTER, TOAST, HEADER)
========================================================= */

window.UIComponentsModule = {
  renderFooter() {
    const footerHTML = `
      <footer class="site-footer">
        <hr class="footer-divider">
        <div class="footer-content">
          <img src="assets/logo1.svg" alt="PimaX Logo" class="footer-logo">
          <span class="footer-text">BẢN QUYỀN THUỘC VỀ PIMAX</span>
        </div>
      </footer>
    `;
    document.body.insertAdjacentHTML('beforeend', footerHTML);
  },

  renderToast() {
    const toastHTML = `
      <div id="toast-message" class="toast-notification">
        <i class="fa-solid fa-circle-check"></i> <span id="toast-text">Đã chép liên kết vào bộ nhớ tạm!</span>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', toastHTML);
  },

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
    this.renderToast();
    this.renderFooter();
  }
};
