// 1. Hàm bật/tắt Cây danh mục (Năm học -> Chặng)
function toggleTree(element) {
  const parent = element.parentElement;
  const targetList = parent.querySelector('.stage-list, .exam-list');
  const icon = element.querySelector('.toggle-icon');

  if (targetList) {
    const isHidden = targetList.style.display === 'none' || getComputedStyle(targetList).display === 'none';

    if (isHidden) {
      targetList.style.display = 'block';
      parent.classList.add('open');
      if (icon) {
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-down');
      }
    } else {
      targetList.style.display = 'none';
      parent.classList.remove('open');
      if (icon) {
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-right');
      }
    }
  }
}

// 2. Chuyển đổi bài thi & cập nhật form tiêu đề, Hash URL, Link Drive Cửa sổ mới & Share Facebook
document.addEventListener('DOMContentLoaded', () => {
  const examItems = document.querySelectorAll('.exam-item');
  const iframe = document.getElementById('drive-preview-iframe');
  
  const titleEl = document.getElementById('preview-title');
  const updateTimeVal = document.getElementById('update-time-val');
  const subtitleVal = document.getElementById('subtitle-val');
  const examTimeVal = document.getElementById('exam-time-val');

  const btnBvt = document.getElementById('btn-bvt');
  const btnSolution = document.getElementById('btn-solution');
  const btnRanking = document.getElementById('btn-ranking');

  const btnShareFb = document.getElementById('btn-share-fb');
  const btnCopyLink = document.getElementById('btn-copy-link');
  const btnDriveLink = document.getElementById('btn-drive-link');
  const toastEl = document.getElementById('toast-message');
  const toastText = document.getElementById('toast-text');

  let currentExamHash = '';
  let currentDriveId = '';

  // Hàm hiển thị Toast Notification
  function showToast(msg) {
    if (toastEl && toastText) {
      toastText.textContent = msg;
      toastEl.classList.add('show');
      setTimeout(() => {
        toastEl.classList.remove('show');
      }, 2500);
    }
  }

  // Hàm chuẩn hóa tiêu đề thành Hash ID (vd: PMXST25−SPRT21 -> PMXST25-SPRT21)
  function getExamHash(titleStr) {
    if (!titleStr) return '';
    return titleStr.split('(')[0].trim().replace(/−/g, '-');
  }

  // Hàm chuyển đổi chuỗi ngày "DD/MM/YYYY" để so sánh ngày gần nhất
  function parseDateStr(dateStr) {
    if (!dateStr) return new Date(0);
    const parts = dateStr.trim().split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
    return new Date(0);
  }

  // Hàm Kích hoạt Bài Thi và Mở đúng nhánh cây
  function activateExam(item) {
    examItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    currentDriveId = item.getAttribute('data-drive-id');
    const title = item.getAttribute('data-title');
    const subtitle = item.getAttribute('data-subtitle');
    const updateTime = item.getAttribute('data-update');
    const timeLimit = item.getAttribute('data-time') || '60 phút';

    const bvt = item.getAttribute('data-bvt');
    const solution = item.getAttribute('data-solution');
    const ranking = item.getAttribute('data-ranking');

    // Cập nhật phông tiêu đề mới: TSABK Tournament/{TÊN BÀI THI}
    if (titleEl) titleEl.textContent = `TSABK Tournament/${title || ''}`;
    if (updateTimeVal) updateTimeVal.textContent = updateTime || '--/--/----';
    if (subtitleVal) subtitleVal.textContent = subtitle || 'Bài Test';
    if (examTimeVal) examTimeVal.textContent = timeLimit;

    if (iframe && currentDriveId) {
      iframe.src = `https://drive.google.com/file/d/${currentDriveId}/preview`;
    }

    if (btnBvt) btnBvt.href = bvt || '#';
    if (btnSolution) btnSolution.href = solution || '#';
    if (btnRanking) btnRanking.href = ranking || '#';

    // Đặt link mở TRỰC TIẾP tệp preview trên Google Drive ở cửa sổ mới cho nút Drive thứ 3
    if (btnDriveLink && currentDriveId) {
      btnDriveLink.href = `https://drive.google.com/file/d/${currentDriveId}/preview`;
    }

    // Cập nhật Hash URL trên thanh địa chỉ
    currentExamHash = getExamHash(title);
    if (currentExamHash) {
      history.replaceState(null, '', `#${currentExamHash}`);
    }

    // Mở nhánh Chặng
    const stageGroup = item.closest('.stage-group');
    if (stageGroup) {
      stageGroup.classList.add('open');
      const stageList = stageGroup.querySelector('.exam-list');
      if (stageList) stageList.style.display = 'block';
      const stageIcon = stageGroup.querySelector('.stage-title .toggle-icon');
      if (stageIcon) {
        stageIcon.classList.remove('fa-chevron-right');
        stageIcon.classList.add('fa-chevron-down');
      }
    }

    // Mở nhánh Năm học
    const yearGroup = item.closest('.year-group');
    if (yearGroup) {
      yearGroup.classList.add('open');
      const yearList = yearGroup.querySelector('.stage-list');
      if (yearList) yearList.style.display = 'block';
      const yearIcon = yearGroup.querySelector('.year-title .toggle-icon');
      if (yearIcon) {
        yearIcon.classList.remove('fa-chevron-right');
        yearIcon.classList.add('fa-chevron-down');
      }
    }
  }

  // TỰ ĐỘNG CHỌN BÀI THI KHI TẢI TRANG
  if (examItems.length > 0) {
    const urlHash = window.location.hash.replace('#', '').trim();
    let targetExam = null;

    // 1. Kiểm tra URL có Hash bài thi hay không
    if (urlHash) {
      examItems.forEach(item => {
        const itemHash = getExamHash(item.getAttribute('data-title'));
        if (itemHash === urlHash) {
          targetExam = item;
        }
      });
    }

    // 2. Nếu không có hash, tự động tìm bài mới nhất
    if (!targetExam) {
      targetExam = examItems[0];
      let maxDate = parseDateStr(targetExam.getAttribute('data-update'));

      examItems.forEach(item => {
        const itemDate = parseDateStr(item.getAttribute('data-update'));
        if (itemDate > maxDate) {
          maxDate = itemDate;
          targetExam = item;
        }
      });
    }

    activateExam(targetExam);

    // Lắng nghe sự kiện chọn bài thi ở Sidebar
    examItems.forEach(item => {
      item.addEventListener('click', function() {
        activateExam(this);
      });
    });
  }

  // NÚT CHIA SẺ FACEBOOK
  if (btnShareFb) {
    btnShareFb.addEventListener('click', () => {
      const shareUrl = encodeURIComponent(window.location.href);
      const fbShareWindow = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
      window.open(fbShareWindow, '_blank', 'width=600,height=500');
    });
  }

  // NÚT LẤY LIÊN KẾT WEBSITE (COPY CLIPBOARD)
  if (btnCopyLink) {
    btnCopyLink.addEventListener('click', () => {
      const fullLink = window.location.href;
      navigator.clipboard.writeText(fullLink).then(() => {
        showToast('Đã chép liên kết bài thi vào bộ nhớ tạm!');
      }).catch(err => {
        console.error('Lỗi khi chép liên kết:', err);
      });
    });
  }
});
