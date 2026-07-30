/* =========================================================
   MODULE: ANSWER SHEET MODAL POPUP (CỬA SỔ XEM BẢNG ĐÁP ÁN)
========================================================= */

window.AnswerModalModule = {
  renderModalHTML() {
    if (document.getElementById('answer-modal-overlay')) return;

    const modalHTML = `
      <div id="answer-modal-overlay" class="answer-modal-overlay">
        <div class="answer-modal-card">
          <div class="answer-modal-header">
            <h3><i class="fa-solid fa-key"></i> <span id="answer-modal-title">Bảng Đáp Án</span></h3>
            <button id="btn-close-answer-modal" class="answer-modal-close" title="Đóng">&times;</button>
          </div>
          <div class="answer-modal-body">
            <div id="answer-grid-container" class="answer-grid"></div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Gắn sự kiện đóng Modal
    document.getElementById('btn-close-answer-modal').addEventListener('click', () => this.close());
    document.getElementById('answer-modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'answer-modal-overlay') this.close();
    });
  },

  show(examCode) {
    this.renderModalHTML();

    const overlay = document.getElementById('answer-modal-overlay');
    const titleEl = document.getElementById('answer-modal-title');
    const container = document.getElementById('answer-grid-container');

    // Làm sạch mã đề thi (loại bỏ khoảng trắng, đổi dấu gạch ngang)
    const cleanCode = examCode ? examCode.split('(')[0].trim().replace(/−/g, '-') : '';
    const bank = window.EXAM_ANSWERS_BANK || {};
    const data = bank[cleanCode] || bank[examCode];

    // Nếu đề thi chưa có đáp án trong Ngân hàng -> Hiện thông báo Toast
    if (!data || !data.answers) {
      const msg = `Bài thi này chưa được cập nhật Bảng đáp án!`;
      if (window.UIComponentsModule && window.UIComponentsModule.showToast) {
        window.UIComponentsModule.showToast(msg, 'fa-solid fa-circle-exclamation');
      } else {
        alert(msg);
      }
      return;
    }

    // Render dữ liệu bảng đáp án
    titleEl.textContent = `Bảng Đáp Án - ${data.examTitle || examCode}`;
    let gridHTML = '';

    Object.keys(data.answers).forEach(qNum => {
      const val = data.answers[qNum];
      gridHTML += `<div class="answer-item"><span class="q-num">Câu ${qNum}</span>`;

      if (typeof val === 'object') {
        // Render dạng Đúng/Sai
        gridHTML += `<div class="tf-box">`;
        Object.keys(val).forEach(sub => {
          gridHTML += `<div class="tf-sub"><span>${sub.toUpperCase()}:</span> <span>${val[sub]}</span></div>`;
        });
        gridHTML += `</div>`;
      } else {
        // Render dạng Chọn 1 đáp án hoặc Điền số
        gridHTML += `<span class="q-val">${val}</span>`;
      }

      gridHTML += `</div>`;
    });

    container.innerHTML = gridHTML;
    overlay.classList.add('show');
  },

  close() {
    const overlay = document.getElementById('answer-modal-overlay');
    if (overlay) overlay.classList.remove('show');
  }
};
