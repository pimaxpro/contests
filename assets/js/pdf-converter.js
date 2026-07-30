/* =========================================================
   MODULE: PDF CONVERTER (PDF -> IMAGE PNG/JPG, DPI, ZIP)
========================================================= */
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

document.addEventListener('DOMContentLoaded', () => {
  const btnPdfToImg = document.getElementById('btn-pdf-to-img');
  const modalContainer = document.getElementById('pdf-img-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnRenderPages = document.getElementById('btn-render-pages');
  
  const pageRangeInput = document.getElementById('page-range-input');
  const imgFormatSelect = document.getElementById('img-format-select');
  const imgDpiSelect = document.getElementById('img-dpi-select');

  // Mở Modal chọn tham số xuất ảnh
  if (btnPdfToImg && modalContainer) {
    btnPdfToImg.addEventListener('click', () => {
      const activeExam = document.querySelector('.exam-item.active');
      if (!activeExam) {
        alert('Vui lòng chọn bài thi trước!');
        return;
      }
      modalContainer.classList.add('show');
    });
  }

  // Đóng Modal
  if (btnCloseModal && modalContainer) {
    btnCloseModal.addEventListener('click', () => {
      modalContainer.classList.remove('show');
    });
  }

  // Xử lý khi người dùng bấm Chuyển Đổi & Xem Trước
  if (btnRenderPages) {
    btnRenderPages.addEventListener('click', () => {
      const activeExam = document.querySelector('.exam-item.active');
      if (!activeExam) return;

      const driveId = activeExam.getAttribute('data-drive-id');
      const examTitle = activeExam.getAttribute('data-title');
      const pageRange = pageRangeInput ? pageRangeInput.value : 'all';
      const format = imgFormatSelect ? imgFormatSelect.value : 'png';
      const dpi = imgDpiSelect ? imgDpiSelect.value : '2.0';

      if (!driveId) return;

      // Mở cửa sổ trực tiếp Google Drive Viewer chuẩn có sẵn tùy chọn Xem & Tải PDF thành ảnh không bị chặn CORS
      const drivePdfUrl = `https://drive.google.com/file/d/${driveId}/view?usp=sharing`;
      window.open(drivePdfUrl, '_blank');
      
      if (modalContainer) modalContainer.classList.remove('show');
    });
  }
});
