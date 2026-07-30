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

// 2. Chuyển đổi bài thi và tải Iframe xem trước ở Cột 2
document.addEventListener('DOMContentLoaded', () => {
  const examItems = document.querySelectorAll('.exam-item');
  const iframe = document.getElementById('drive-preview-iframe');
  const titleEl = document.getElementById('preview-title');
  const dateEl = document.getElementById('preview-date');
  const timeEl = document.getElementById('preview-time');

  if (examItems.length > 0) {
    examItems.forEach(item => {
      item.addEventListener('click', function() {
        examItems.forEach(i => i.classList.remove('active'));
        this.classList.add('active');

        const driveId = this.getAttribute('data-drive-id');
        const title = this.getAttribute('data-title');
        const date = this.getAttribute('data-date');
        const time = this.getAttribute('data-time');

        if (titleEl) titleEl.textContent = title || 'Xem trước bài thi';
        if (dateEl) dateEl.textContent = date || 'N/A';
        if (timeEl) timeEl.textContent = time || 'N/A';

        if (iframe && driveId) {
          iframe.src = `https://drive.google.com/file/d/${driveId}/preview`;
        }
      });
    });
  }
});

// 3. Hàm ẩn/hiện Lời giải (cho blog.html)
function toggleSolution(btn) {
  const content = btn.nextElementSibling;
  if (content) {
    content.classList.toggle("open");
    if (content.classList.contains("open") && window.MathJax) {
      MathJax.typesetPromise([content]);
    }
  }
}
// Xử lý đóng/mở Modal Thể lệ cuộc thi
function openRulesModal() {
  const modal = document.getElementById('rules-modal');
  if (modal) modal.classList.add('open');
}

function closeRulesModal() {
  const modal = document.getElementById('rules-modal');
  if (modal) modal.classList.remove('open');
}

// Bấm ra ngoài vùng trắng của modal để đóng
window.addEventListener('click', function(e) {
  const modal = document.getElementById('rules-modal');
  if (e.target === modal) {
    closeRulesModal();
  }
});
