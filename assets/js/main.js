/* =========================================================
   CORE MAIN INITIALIZER (DISPATCHER)
========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const examItems = document.querySelectorAll('.exam-item');

  // Khởi tạo các Mô-đun phụ
  if (window.ShareActionsModule) {
    window.ShareActionsModule.init();
  }

  function activateExam(item) {
    examItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    // Gọi module render preview
    if (window.PdfViewerModule) {
      window.PdfViewerModule.renderPreview(item);
    }

    // Gọi module mở nhánh cây danh mục
    if (window.MenuTreeModule) {
      window.MenuTreeModule.expandParentsOfItem(item);
    }
  }

  // Tự động chọn bài thi mặc định hoặc từ Hash URL
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
