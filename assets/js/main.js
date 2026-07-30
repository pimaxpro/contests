/* =========================================================
   CORE MAIN INITIALIZER (DISPATCHER)
========================================================= */

document.addEventListener('DOMContentLoaded', async () => {
  // 0. BỔ SUNG: Tự động nạp file dữ liệu tương ứng (data-tournament.js hoặc data-marathon.js) dựa vào URL ?type=...
  const urlParams = new URLSearchParams(window.location.search);
  let contestType = urlParams.get('type');

  if (!contestType) {
    if (window.location.pathname.includes('Marathon')) contestType = 'marathon';
    else contestType = 'tournament';
  }

  // Nạp dữ liệu động trước khi chạy các phần bên dưới
  await new Promise((resolve) => {
    const isMarathon = contestType === 'marathon';
    const scriptId = 'data-contest-script';
    let dataScript = document.getElementById(scriptId);
    if (dataScript) dataScript.remove();

    dataScript = document.createElement('script');
    dataScript.id = scriptId;
    dataScript.src = isMarathon ? 'assets/js/data/data-marathon.js' : 'assets/js/data/data-tournament.js';
    dataScript.onload = () => resolve();
    document.head.appendChild(dataScript);
  });

  // =========================================================
  // GIỮ NGUYÊN 100% TOÀN BỘ LOGIC GỐC CỦA THẦY Ở DƯỚI NÀY
  // =========================================================

  // 1. Tự động Render Footer & Toast Notification chung
  if (window.UIComponentsModule) {
    window.UIComponentsModule.init();
  }

  const data = window.CONTEST_DATA;
  if (!data) return;

  // 2. Thiết lập Theme Class động (VD: theme-marathon)
  if (data.themeClass) {
    document.body.classList.add(data.themeClass);
  }

  // 3. Cập nhật Tiêu đề và Mô tả Hero Header động
  const heroTitle = document.getElementById('hero-title');
  const heroSub = document.getElementById('hero-sub');
  if (heroTitle) heroTitle.textContent = data.title;
  if (heroSub) heroSub.textContent = data.subTitle;

  // 4. Render Cây danh mục bài thi động từ Module Data
  if (window.MenuTreeModule) {
    window.MenuTreeModule.render('tree-menu', data);
  }

  // 5. Khởi tạo Sự kiện cho Bộ nút Chia sẻ (Facebook, Copy Link)
  if (window.ShareActionsModule) {
    window.ShareActionsModule.init();
  }

  // 6. Quản lý việc Chọn & Kích hoạt Bài thi
  const examItems = document.querySelectorAll('.exam-item');

  function activateExam(item) {
    examItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    // Cập nhật Khung Xem trước PDF
    if (window.PdfViewerModule) {
      window.PdfViewerModule.renderPreview(item);
    }

    // Tự động Mở các Nhánh Cây chứa Bài thi được chọn
    if (window.MenuTreeModule) {
      window.MenuTreeModule.expandParentsOfItem(item);
    }
  }

  // 7. Tự động Chọn Bài thi Mới nhất hoặc Bài thi từ Hash trên URL
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
