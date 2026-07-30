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

// 2. Xử lý tự động so sánh ngày data-update để lấy bài mới nhất & bắt sự kiện click
document.addEventListener('DOMContentLoaded', () => {
  const examItems = document.querySelectorAll('.exam-item');
  const iframe = document.getElementById('drive-preview-iframe');
  const titleEl = document.getElementById('preview-title');
  const updateTimeVal = document.getElementById('update-time-val');
  
  const btnBvt = document.getElementById('btn-bvt');
  const btnSolution = document.getElementById('btn-solution');
  const btnRanking = document.getElementById('btn-ranking');

  // Hàm chuyển đổi chuỗi "DD/MM/YYYY" thành đối tượng Date trong JS để so sánh
  function parseDateStr(dateStr) {
    if (!dateStr) return new Date(0);
    const parts = dateStr.trim().split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Tháng trong JS tính từ 0 - 11
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(0);
  }

  // Hàm active bài thi & tự động mở nhánh cây danh mục chứa nó
  function activateExam(item) {
    examItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    const driveId = item.getAttribute('data-drive-id');
    const title = item.getAttribute('data-title');
    const updateTime = item.getAttribute('data-update');
    const bvt = item.getAttribute('data-bvt');
    const solution = item.getAttribute('data-solution');
    const ranking = item.getAttribute('data-ranking');

    if (titleEl) titleEl.textContent = title || 'Xem trước bài thi';
    if (updateTimeVal) updateTimeVal.textContent = updateTime || 'N/A';

    if (iframe && driveId) {
      iframe.src = `https://drive.google.com/file/d/${driveId}/preview`;
    }

    if (btnBvt) btnBvt.href = bvt || '#';
    if (btnSolution) btnSolution.href = solution || '#';
    if (btnRanking) btnRanking.href = ranking || '#';

    // Tự động mở nhánh Chặng chứa bài thi này
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

    // Tự động mở nhánh Năm học chứa bài thi này
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

  if (examItems.length > 0) {
    // Tìm bài thi có ngày "data-update" mới nhất (lớn nhất)
    let newestItem = examItems[0];
    let maxDate = parseDateStr(newestItem.getAttribute('data-update'));

    examItems.forEach(item => {
      const itemDate = parseDateStr(item.getAttribute('data-update'));
      if (itemDate > maxDate) {
        maxDate = itemDate;
        newestItem = item;
      }
    });

    // Mặc định tự chọn & mở đúng nhánh cây cho bài mới nhất
    activateExam(newestItem);

    // Bắt sự kiện khi người dùng click xem bài khác ở cột trái
    examItems.forEach(item => {
      item.addEventListener('click', function() {
        activateExam(this);
      });
    });
  }
});
