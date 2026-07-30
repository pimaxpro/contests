/* =========================================================
   MODULE: ANSWER SHEET MODAL POPUP (DYNAMIC LOADER)
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

    document.getElementById('btn-close-answer-modal').addEventListener('click', () => this.close());
    document.getElementById('answer-modal-overlay').addEventListener('click', (e) => {
      if (e.target.id === 'answer-modal-overlay') this.close();
    });
  },

  // Hàm hỗ trợ tự động tải file JS đáp án động khi người dùng bấm
  loadAnswerScript(contestType, cleanCode) {
    return new Promise((resolve, reject) => {
      const scriptId = `script-answer-${cleanCode}`;
      
      // Nếu file đáp án này đã được nạp trước đó rồi thì bỏ qua
      if (document.getElementById(scriptId)) {
        resolve(true);
        return;
      }

      // Tự động tạo thẻ script nạp file đáp án đúng thư mục
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `assets/js/data/answers/${contestType}/${cleanCode}.js`;

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false); // Nếu không tìm thấy file đáp án

      document.head.appendChild(script);
    });
  },

  async show(examCode) {
    this.renderModalHTML();

    const cleanCode = examCode ? examCode.split('(')[0].trim().replace(/−/g, '-') : '';
    const isMarathonPage = document.body.classList.contains('theme-marathon') || window.location.pathname.includes('Marathon.html');
    const contestType = isMarathonPage ? 'marathon' : 'tournament';

    window.EXAM_ANSWERS_BANK = window.EXAM_ANSWERS_BANK || {};

    // 1. Tự động nạp tệp đáp án nếu chưa có sẵn trong bộ nhớ
    if (!window.EXAM_ANSWERS_BANK[cleanCode] && !window.EXAM_ANSWERS_BANK[examCode]) {
      await this.loadAnswerScript(contestType, cleanCode);
    }

    const data = window.EXAM_ANSWERS_BANK[cleanCode] || window.EXAM_ANSWERS_BANK[examCode];

    // 2. Nếu file không tồn tại hoặc đề chưa được nhập đáp án
    if (!data || !data.answers) {
      const msg = `Bài thi này chưa được cập nhật Bảng đáp án!`;
      if (window.UIComponentsModule && window.UIComponentsModule.showToast) {
        window.UIComponentsModule.showToast(msg, 'fa-solid fa-circle-exclamation');
      } else {
        alert(msg);
      }
      return;
    }

    // 3. Hiển thị Bảng đáp án
    const overlay = document.getElementById('answer-modal-overlay');
    const titleEl = document.getElementById('answer-modal-title');
    const container = document.getElementById('answer-grid-container');

    titleEl.textContent = `Bảng Đáp Án - ${data.examTitle || examCode}`;
    let gridHTML = '';

    Object.keys(data.answers).forEach(qNum => {
      const val = data.answers[qNum];
      gridHTML += `<div class="answer-item"><span class="q-num">Câu ${qNum}</span>`;

      if (typeof val === 'object') {
        gridHTML += `<div class="tf-box">`;
        Object.keys(val).forEach(sub => {
          gridHTML += `<div class="tf-sub"><span>${sub.toUpperCase()}:</span> <span>${val[sub]}</span></div>`;
        });
        gridHTML += `</div>`;
      } else {
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
