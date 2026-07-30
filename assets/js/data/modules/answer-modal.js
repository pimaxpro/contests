/* =========================================================
   MODULE: ANSWER SHEET DRAWER (KHUNG BẢNG ĐÁP ÁN SONG SONG PDF)
========================================================= */

window.AnswerModalModule = {
  renderDrawerHTML() {
    if (document.getElementById('answer-box-drawer')) return;

    const previewArea = document.querySelector('.preview-area');
    const iframeContainer = document.querySelector('.drive-iframe-container');

    if (!previewArea || !iframeContainer) return;

    const drawerHTML = `
      <div id="answer-box-drawer" class="answer-box-drawer">
        <div class="answer-drawer-header">
          <h3><i class="fa-solid fa-key"></i> <span id="answer-drawer-title">Bảng Đáp Án</span></h3>
          <button id="btn-close-answer-drawer" class="btn-close-drawer" title="Thu gọn đáp án"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="answer-drawer-body">
          <div id="answer-drawer-container"></div>
        </div>
      </div>
    `;

    // Chèn Khung Đáp Án vào ngay trước Khung xem PDF (iframe)
    iframeContainer.insertAdjacentHTML('beforebegin', drawerHTML);

    document.getElementById('btn-close-answer-drawer').addEventListener('click', () => this.hide());
  },

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

  renderAnswerGrid(answersObj, autoResetIndex = false) {
    let gridHTML = `<div class="answer-grid">`;
    let index = 1;

    Object.keys(answersObj).forEach(qKey => {
      const val = answersObj[qKey];
      const displayNum = autoResetIndex ? index : qKey;

      gridHTML += `<div class="answer-item"><span class="q-num">Câu ${displayNum}</span>`;

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
      index++;
    });

    gridHTML += `</div>`;
    return gridHTML;
  },

  async toggle(examCode) {
    this.renderDrawerHTML();

    const drawerEl = document.getElementById('answer-box-drawer');
    const btnAnswers = document.getElementById('btn-answers');

    // Nếu đang mở mà bấm lại nút "Đáp án" -> Thu gọn lại
    if (drawerEl && drawerEl.classList.contains('show')) {
      this.hide();
      return;
    }

    const cleanCode = examCode ? examCode.split('(')[0].trim().replace(/−/g, '-') : '';
    const isMarathonPage = document.body.classList.contains('theme-marathon') || window.location.pathname.includes('Marathon.html') || window.location.search.includes('type=marathon');
    const contestType = isMarathonPage ? 'marathon' : 'tournament';

    window.EXAM_ANSWERS_BANK = window.EXAM_ANSWERS_BANK || {};

    if (!window.EXAM_ANSWERS_BANK[cleanCode] && !window.EXAM_ANSWERS_BANK[examCode]) {
      await this.loadAnswerScript(contestType, cleanCode);
    }

    const data = window.EXAM_ANSWERS_BANK[cleanCode] || window.EXAM_ANSWERS_BANK[examCode];

    if (!data || (!data.answers && !data.sections)) {
      const msg = `Bài thi này chưa được cập nhật Bảng đáp án!`;
      if (window.UIComponentsModule && window.UIComponentsModule.showToast) {
        window.UIComponentsModule.showToast(msg, 'fa-solid fa-circle-exclamation');
      } else {
        alert(msg);
      }
      return;
    }

    const titleEl = document.getElementById('answer-drawer-title');
    const container = document.getElementById('answer-drawer-container');

    titleEl.textContent = `Bảng Đáp Án - ${data.examTitle || examCode}`;
    let bodyHTML = '';

    if (data.sections && Array.isArray(data.sections)) {
      data.sections.forEach(sec => {
        bodyHTML += `<h4 class="section-header-title">${sec.sectionName}</h4>`;
        bodyHTML += this.renderAnswerGrid(sec.answers, true);
      });
    } else if (data.answers) {
      bodyHTML = this.renderAnswerGrid(data.answers, false);
    }

    container.innerHTML = bodyHTML;
    drawerEl.classList.add('show');
    if (btnAnswers) btnAnswers.classList.add('active');
  },

  hide() {
    const drawerEl = document.getElementById('answer-box-drawer');
    const btnAnswers = document.getElementById('btn-answers');

    if (drawerEl) drawerEl.classList.remove('show');
    if (btnAnswers) btnAnswers.classList.remove('active');
  }
};
