/* =========================================================
   CORE MAIN INITIALIZER (DISPATCHER)
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const data = window.CONTEST_DATA;
  if (!data) return;

  // 1. Cập nhật Theme & Hero Header động
  if (data.themeClass) {
    document.body.classList.add(data.themeClass);
  }

  const heroTitle = document.getElementById('hero-title');
  const heroSub = document.getElementById('hero-sub');
  if (heroTitle) heroTitle.textContent = data.title;
  if (heroSub) heroSub.textContent = data.subTitle;

  // 2. Render Cây danh mục động từ Module Data
  if (window.MenuTreeModule) {
    window.MenuTreeModule.render('tree-menu', data);
  }

  // 3. Khởi tạo Mô-đun Share Actions
  if (window.ShareActionsModule) {
    window.ShareActionsModule.init();
  }

  // 4. Lấy danh sách bài thi vừa được Render
  const examItems = document.querySelectorAll('.exam-item');

  function activateExam(item) {
    examItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    if (window.PdfViewerModule) {
      window.PdfViewerModule.renderPreview(item);
    }

    if (window.MenuTreeModule) {
      window.MenuTreeModule.expandParentsOfItem(item);
    }
  }

  // 5. Tự động chọn bài thi mặc định hoặc từ URL Hash
  if (examItems.length > 0) {
    const urlHash = window.location.hash.replace('#', '').trim();
    let targetExam = null;

    if (urlHash && window.PdfViewerModule) {
      examItems.forEach(item => {
        const itemHash = window.PdfViewerModule.getExamHash(item.getAttribute('data-title'));
        if (itemHash === urlHash) {
          targetExam = item;
        }
      });
    }

    if (!targetExam && window.PdfViewerModule) {
      targetExam = examItems[0];
      let maxDate = window.PdfViewerModule.parseDateStr(targetExam.getAttribute('data-update'));

      examItems.forEach(item => {
        const itemDate = window.PdfViewerModule.parseDateStr(item.getAttribute('data-update'));
        if (itemDate > maxDate) {
          maxDate = itemDate;
          targetExam = item;
        }
      });
    }

    if (targetExam) {
      activateExam(targetExam);
    }

    examItems.forEach(item => {
      item.addEventListener('click', function() {
        activateExam(this);
      });
    });
  }
});
