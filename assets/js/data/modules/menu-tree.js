/* =========================================================
   MODULE 1: RENDER TREE MENU DỰA TRÊN CONTEST_DATA
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

window.MenuTreeModule = {
  render(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container || !data || !data.years) return;

    let html = '';

    // 1. Thẻ chọn Kì thi
    const isTournament = data.id === 'tournament';
    html += `
      <div class="contest-selector-box" style="margin-bottom: 12px;">
        <a href="Tournament.html" class="year-title ${isTournament ? 'active-contest' : ''}" style="${!isTournament ? 'opacity: 0.85;' : ''}">
          <i class="fa-solid fa-trophy"></i>
          <span>1. TSABK Tournament</span>
        </a>
        <a href="Marathon.html" class="year-title ${!isTournament ? 'active-contest' : ''}" style="${isTournament ? 'margin-top: 6px; opacity: 0.85;' : 'margin-top: 6px;'}">
          <i class="fa-solid fa-person-running"></i>
          <span>2. Infinity Marathon</span>
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #edf2f7; margin: 10px 0 14px;">
    `;

    // 2. Render các Năm học, Chặng và Bài thi
    data.years.forEach(year => {
      const yearDisplay = year.isOpen ? 'block' : 'none';
      const yearIcon = year.isOpen ? 'fa-chevron-down' : 'fa-chevron-right';

      html += `
        <div class="year-group ${year.isOpen ? 'open' : ''}">
          <div class="year-title" onclick="toggleTree(this)">
            <i class="fa-solid ${yearIcon} toggle-icon"></i>
            <i class="fa-solid fa-graduation-cap"></i>
            <span>${year.name}</span>
          </div>

          <div class="stage-list" style="display: ${yearDisplay};">
      `;

      year.stages.forEach(stage => {
        const stageDisplay = stage.isOpen ? 'block' : 'none';
        const stageIcon = stage.isOpen ? 'fa-chevron-down' : 'fa-chevron-right';

        html += `
            <div class="stage-group ${stage.isOpen ? 'open' : ''}">
              <div class="stage-title" onclick="toggleTree(this)">
                <i class="fa-solid ${stageIcon} toggle-icon"></i>
                <i class="fa-solid ${stage.icon || 'fa-leaf'}"></i>
                <span>${stage.name}</span>
              </div>
              <ul class="exam-list" style="display: ${stageDisplay};">
        `;

        stage.exams.forEach(exam => {
          html += `
            <li class="exam-item" 
                data-drive-id="${exam.id}" 
                data-title="${exam.title}"
                data-subtitle="${exam.subtitle}"
                data-update="${exam.update}"
                data-time="${exam.time}"
                data-solution="${exam.solution || '#'}"
                data-ranking="${exam.ranking || '#'}">
              <i class="fa-regular fa-file-lines"></i> ${exam.title}
            </li>
          `;
        });

        html += `
              </ul>
            </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  expandParentsOfItem(item) {
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
};
