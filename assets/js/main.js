// 1. Bật/tắt Cây danh mục (Năm học -> Chặng)
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

// 2. Chuyển đổi bài thi & cập nhật các đường link BVT / Solution / Ranking
document.addEventListener('DOMContentLoaded', () => {
  const examItems = document.querySelectorAll('.exam-item');
  const iframe = document.getElementById('drive-preview-iframe');
  const titleEl = document.getElementById('preview-title');
  
  const btnBvt = document.getElementById('btn-bvt');
  const btnSolution = document.getElementById('btn-solution');
  const btnRanking = document.getElementById('btn-ranking');

  if (examItems.length > 0) {
    examItems.forEach(item => {
      item.addEventListener('click', function() {
        examItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');

        const driveId = this.getAttribute('data-drive-id');
        const title = this.getAttribute('data-title');
        const bvt = this.getAttribute('data-bvt');
        const solution = this.getAttribute('data-solution');
        const ranking = this.getAttribute('data-ranking');

        if (titleEl) titleEl.textContent = title || 'Xem trước bài thi';

        if (iframe && driveId) {
          iframe.src = `https://drive.google.com/file/d/${driveId}/preview`;
        }

        if (btnBvt) btnBvt.href = bvt || '#';
        if (btnSolution) btnSolution.href = solution || '#';
        if (btnRanking) btnRanking.href = ranking || '#';
      });
    });
  }
});

// 3. Hàm mở và đóng Modal Popup Thể lệ cuộc thi
function openRulesModal() {
  const modal = document.getElementById('rules-modal');
  if (modal) {
    modal.classList.add('open');
  }
}

function closeRulesModal() {
  const modal = document.getElementById('rules-modal');
  if (modal) {
    modal.classList.remove('open');
  }
}

// Đóng modal khi bấm ra ngoài phần phông nền tối
window.addEventListener('click', function(e) {
  const modal = document.getElementById('rules-modal');
  if (e.target === modal) {
    closeRulesModal();
  }
});
