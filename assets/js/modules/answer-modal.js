/* =========================================================
   MODULE: ANSWER SHEET MODAL POPUP (RESET SỐ CÂU THEO PHẦN)
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
            <div id="answer-grid-container"></div>
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

  // Hàm tự động nạp file .js đáp án khi bấm nút
  loadAnswerScript(contestType, cleanCode) {
    return new Promise((resolve) => {
      const scriptId = `script-answer-${cleanCode}`;
      if (document.getElementById(scriptId)) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `assets/js/data/answers/${contestType}/${cleanCode}.js`;

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.head.appendChild(script);
    });
  },

  // Hàm Render danh sách đáp án (Hỗ trợ tham số autoResetIndex để đánh lại từ Câu 1)
  renderAnswerGrid(answersObj, autoResetIndex = false) {
    let gridHTML = `<div class="answer-grid">`;
    let index = 1;

    Object.keys(answersObj).forEach(qKey => {
      const val = answersObj[qKey];
      
      // Nếu autoResetIndex = true -> Đánh lại số câu 1, 2, 3...
      // Nếu autoResetIndex = false -> Lấy theo Key gốc của dữ liệu
      const displayNum = autoResetIndex ? index : qKey;

      gridHTML += `<div class="answer-item"><span class="q-num">Câu ${displayNum}</span>`;

      if (typeof val === 'object') {
        // Dạng Đúng / Sai (True / False)
        gridHTML += `<div class="tf-box">`;
        Object.keys(val).forEach(sub => {
          gridHTML += `<div class="tf-sub"><span>${sub.toUpperCase()}:</span> <span>${val[sub]}</span></div>`;
        });
        gridHTML += `</div>`;
      } else {
        // Dạng Trắc nghiệm chọn 1 / Điền số / Trả lời ngắn
        gridHTML += `<span class="q-val">${val}</span>`;
      }

      gridHTML += `</div>`;
      index++;
    });

    gridHTML += `</div>`;
    return gridHTML;
  },

  async show(examCode) {
    this.renderModalHTML();

    const cleanCode = examCode ? examCode.split('(')[0].trim().replace(/−/g, '-') : '';
    const isMarathonPage = document.body.classList.contains('theme-marathon') || window.location.pathname.includes('Marathon.html');
    const contestType = isMarathonPage ? 'marathon' : 'tournament';

    window.EXAM_ANSWERS_BANK = window.EXAM_ANSWERS_BANK || {};

    // Nạp file đáp án nếu chưa có [cite: 171]
    if (!window.EXAM_ANSWERS_BANK[cleanCode] && !window.EXAM_ANSWERS_BANK[examCode]) {
      await this.loadAnswerScript(contestType, cleanCode);
    }

    const data = window.EXAM_ANSWERS_BANK[cleanCode] || window.EXAM_ANSWERS_BANK[examCode];

    // Xử lý khi chưa cập nhật đáp án [cite: 172]
    if (!data || (!data.answers && !data.sections)) {
      const msg = `Bài thi này chưa được cập nhật Bảng đáp án!`;
      if (window.UIComponentsModule && window.UIComponentsModule.showToast) {
        window.UIComponentsModule.showToast(msg, 'fa-solid fa-circle-exclamation');
      } else {
        alert(msg);
      }
      return;
    }

    const overlay = document.getElementById('answer-modal-overlay');
    const titleEl = document.getElementById('answer-modal-title');
    const container = document.getElementById('answer-grid-container');

    titleEl.textContent = `Bảng Đáp Án - ${data.examTitle || examCode}`;
    let bodyHTML = '';

    // DẠNG 1: ĐÁP ÁN CHIA THÀNH TỪNG PHẦN (SECTIONS) -> ĐÁNH LẠI TỪ CÂU 1 Ở MỖI PHẦN [cite: 183]
    if (data.sections && Array.isArray(data.sections)) {
      data.sections.forEach(sec => {
        bodyHTML += `<h4 class="section-header-title">${sec.sectionName}</h4>`;
        // Truyền autoResetIndex = true để tự động đánh lại số câu từ 1 cho từng Phần
        bodyHTML += this.renderAnswerGrid(sec.answers, true);
      });
    } 
    // DẠNG 2: ĐÁP ÁN DANH SÁCH THẲNG (ANSWERS) -> GIỮ NGUYÊN SỐ CÂU GỐC [cite: 183]
    else if (data.answers) {
      bodyHTML = this.renderAnswerGrid(data.answers, false);
    }

    container.innerHTML = bodyHTML;
    overlay.classList.add('show');
  },

  close() {
    const overlay = document.getElementById('answer-modal-overlay');
    if (overlay) overlay.classList.remove('show');
  }
};
