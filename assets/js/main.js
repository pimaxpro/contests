/* =========================================================
   CORE MAIN JS: TREE MENU & EXAM SELECTION
========================================================= */
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
  const btnDriveLink = document.getElementById('btn-drive-link');

  const isMarathonPage = document.body.classList.contains('theme-marathon') || window.location.pathname.includes('Marathon.html');
  const contestPrefix = isMarathonPage ? 'Infinity/' : 'TSABK Tournament/';

  function getExamHash(titleStr) {
    if (!titleStr) return '';
    return titleStr.split('(')[0].trim().replace(/−/g, '-');
  }

  function parseDateStr(dateStr) {
    if (!dateStr) return new Date(0);
    const parts = dateStr.trim().split('/');
    if (parts.length === 3) {
      return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    }
    return new Date(0);
  }

  function activateExam(item) {
    examItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    const driveId = item.getAttribute('data-drive-id');
    const examTitle = item.getAttribute('data-title');
    const subtitle = item.getAttribute('data-subtitle');
    const updateTime = item.getAttribute('data-update');
    const timeLimit = item.getAttribute('data-time') || '60 phút';

    const bvt = item.getAttribute('data-bvt');
    const solution = item.getAttribute('data-solution');
    const ranking = item.getAttribute('data-ranking');

    if (titleEl) titleEl.textContent = `${contestPrefix}${examTitle || ''}`;
    if (updateTimeVal) updateTimeVal.textContent = updateTime || '--/--/----';
    if (subtitleVal) subtitleVal.textContent = subtitle || 'Bài Test';
    if (examTimeVal) examTimeVal.textContent = timeLimit;

    if (iframe && driveId) {
      iframe.src = `https://drive.google.com/file/d/${driveId}/preview`;
    }

    if (btnBvt) btnBvt.href = bvt || '#';
    if (btnSolution) btnSolution.href = solution || '#';
    if (btnRanking) btnRanking.href = ranking || '#';

    if (btnDriveLink && driveId) {
      btnDriveLink.href = `https://drive.google.com/file/d/${driveId}/view?usp=sharing`;
    }

    const currentExamHash = getExamHash(examTitle);
    if (currentExamHash) {
      history.replaceState(null, '', `#${currentExamHash}`);
    }

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

    if (urlHash) {
      examItems.forEach(item => {
        const itemHash = getExamHash(item.getAttribute('data-title'));
        if (itemHash === urlHash) {
          targetExam = item;
        }
      });
    }

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

    examItems.forEach(item => {
      item.addEventListener('click', function() {
        activateExam(this);
      });
    });
  }
});
