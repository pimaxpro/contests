/* =========================================================
   MODULE 2: PDF PREVIEW VIEWER MANAGEMENT
========================================================= */

window.PdfViewerModule = {
  getExamHash(titleStr) {
    if (!titleStr) return '';
    return titleStr.split('(')[0].trim().replace(/−/g, '-');
  },

  parseDateStr(dateStr) {
    if (!dateStr) return new Date(0);
    const parts = dateStr.trim().split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
    return new Date(0);
  },

  setupButtonLink(buttonEl, url, resourceName) {
    if (!buttonEl) return;

    const newButton = buttonEl.cloneNode(true);
    buttonEl.parentNode.replaceChild(newButton, buttonEl);

    const isValidUrl = url && url.trim() !== '' && url.trim() !== '#';

    if (isValidUrl) {
      newButton.href = url;
      newButton.target = '_blank';
      newButton.style.opacity = '1';
      newButton.style.cursor = 'pointer';
    } else {
      newButton.href = 'javascript:void(0);';
      newButton.removeAttribute('target');
      newButton.style.opacity = '0.65';
      
      newButton.addEventListener('click', (e) => {
        e.preventDefault();
        const msg = `Bài thi này chưa được cập nhật ${resourceName}!`;
        if (window.UIComponentsModule && window.UIComponentsModule.showToast) {
          window.UIComponentsModule.showToast(msg, 'fa-solid fa-circle-exclamation');
        } else {
          alert(msg);
        }
      });
    }
  },

  renderPreview(item) {
    const iframe = document.getElementById('drive-preview-iframe');
    const titleEl = document.getElementById('preview-title');
    const updateTimeVal = document.getElementById('update-time-val');
    const subtitleVal = document.getElementById('subtitle-val');
    const examTimeVal = document.getElementById('exam-time-val');

    const btnAnswers = document.getElementById('btn-answers');
    const btnSolution = document.getElementById('btn-solution');
    const btnRanking = document.getElementById('btn-ranking');
    const btnDriveLink = document.getElementById('btn-drive-link');

    const isMarathonPage = document.body.classList.contains('theme-marathon') || window.location.pathname.includes('Marathon.html') || window.location.search.includes('type=marathon');
    const contestPrefix = isMarathonPage ? 'Infinity/' : 'TSABK Tournament/';

    const driveId = item.getAttribute('data-drive-id');
    const examTitle = item.getAttribute('data-title');
    const subtitle = item.getAttribute('data-subtitle');
    const updateTime = item.getAttribute('data-update');
    const timeLimit = item.getAttribute('data-time') || '60 phút';

    const solution = item.getAttribute('data-solution');
    const ranking = item.getAttribute('data-ranking');

    if (titleEl) titleEl.textContent = `${contestPrefix}${examTitle || ''}`;
    if (updateTimeVal) updateTimeVal.textContent = updateTime || '--/--/----';
    if (subtitleVal) subtitleVal.textContent = subtitle || 'Bài Test';
    if (examTimeVal) examTimeVal.textContent = timeLimit;

    if (iframe && driveId) {
      iframe.src = `https://drive.google.com/file/d/${driveId}/preview`;
    }

    // Ẩn bảng đáp án cũ nếu đang chuyển sang bài thi khác
    if (window.AnswerModalModule) {
      window.AnswerModalModule.hide();
    }

    // Gắn sự kiện Bật/Tắt cho Nút Đáp án
    if (btnAnswers) {
      const newBtnAnswers = btnAnswers.cloneNode(true);
      btnAnswers.parentNode.replaceChild(newBtnAnswers, btnAnswers);
      
      newBtnAnswers.addEventListener('click', () => {
        if (window.AnswerModalModule) {
          window.AnswerModalModule.toggle(examTitle);
        }
      });
    }

    this.setupButtonLink(btnRanking, ranking, 'Ranking');
    this.setupButtonLink(btnSolution, solution, 'Solution');

    if (btnDriveLink && driveId) {
      btnDriveLink.href = `https://drive.google.com/file/d/${driveId}/view?usp=sharing`;
    }

    const examHash = this.getExamHash(examTitle);
    if (examHash) {
      history.replaceState(null, '', `#${examHash}`);
    }
  }
};
