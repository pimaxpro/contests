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

// 2. Chuyển đổi bài thi & tự động mở các cấp thư mục cha của bài thi active
document.addEventListener('DOMContentLoaded', () => {
  const examItems = document.querySelectorAll('.exam-item');
  const iframe = document.getElementById('drive-preview-iframe');
  const titleEl = document.getElementById('preview-title');
  const updateTimeVal = document.getElementById('update-time-val');
  
  const btnBvt = document.getElementById('btn-bvt');
  const btnSolution = document.getElementById('btn-solution');
  const btnRanking = document.getElementById('btn-ranking');

  // Hàm active bài thi và tự động mở nhánh cây tương ứng
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

    // Mở nhánh chặng
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

    // Mở nhánh năm học
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

  // Tự động load dữ liệu cho bài thi có class active đầu tiên
  const activeExam = document.querySelector('.exam-item.active') || examItems[0];
  if (activeExam) {
    activateExam(activeExam);
  }

  // Sự kiện khi bấm vào từng bài thi ở sidebar
  if (examItems.length > 0) {
    examItems.forEach(item => {
      item.addEventListener('click', function() {
        activateExam(this);
      });
    });
  }
});
