/* =========================================================
   MODULE: SHARED UI COMPONENTS (FOOTER, TOAST, HEADER)
========================================================= */

window.UIComponentsModule = {
  // Tự động nhúng Footer vào cuối body
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

  // Tự động nhúng Toast Notification
  renderToast() {
    const toastHTML = `
      <div id="toast-message" class="toast-notification">
        <i class="fa-solid fa-circle-check"></i> <span id="toast-text">Đã chép liên kết vào bộ nhớ tạm!</span>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', toastHTML);
  },

  init() {
    this.renderToast();
    this.renderFooter();
  }
};
