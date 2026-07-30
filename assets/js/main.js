// Cấu hình Worker PDF.js
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

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

  const btnShareFb = document.getElementById('btn-share-fb');
  const btnCopyLink = document.getElementById('btn-copy-link');
  const btnDriveLink = document.getElementById('btn-drive-link');
  const btnPdfToImg = document.getElementById('btn-pdf-to-img');

  const modalContainer = document.getElementById('pdf-img-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnRenderPages = document.getElementById('btn-render-pages');
  const btnDownloadZip = document.getElementById('btn-download-all-zip');
  
  const pageRangeInput = document.getElementById('page-range-input');
  const imgFormatSelect = document.getElementById('img-format-select');
  const imgDpiSelect = document.getElementById('img-dpi-select');
  const progressBarBox = document.getElementById('progress-bar-box');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const renderStatus = document.getElementById('pdf-render-status');
  const imagesPreviewGrid = document.getElementById('pdf-images-preview-grid');

  const toastEl = document.getElementById('toast-message');
  const toastText = document.getElementById('toast-text');

  let currentExamHash = '';
  let currentDriveId = '';
  let currentExamTitle = '';
  let currentPdfDocument = null;
  let renderedImagesData = [];

  const isMarathonPage = document.body.classList.contains('theme-marathon') || window.location.pathname.includes('Marathon.html');
  const contestPrefix = isMarathonPage ? 'Infinity/' : 'TSABK Tournament/';

  function showToast(msg) {
    if (toastEl && toastText) {
      toastText.textContent = msg;
      toastEl.classList.add('show');
      setTimeout(() => {
        toastEl.classList.remove('show');
      }, 2500);
    }
  }

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

    currentDriveId = item.getAttribute('data-drive-id');
    currentExamTitle = item.getAttribute('data-title');
    const subtitle = item.getAttribute('data-subtitle');
    const updateTime = item.getAttribute('data-update');
    const timeLimit = item.getAttribute('data-time') || '60 phút';

    const bvt = item.getAttribute('data-bvt');
    const solution = item.getAttribute('data-solution');
    const ranking = item.getAttribute('data-ranking');

    if (titleEl) titleEl.textContent = `${contestPrefix}${currentExamTitle || ''}`;
    if (updateTimeVal) updateTimeVal.textContent = updateTime || '--/--/----';
    if (subtitleVal) subtitleVal.textContent = subtitle || 'Bài Test';
    if (examTimeVal) examTimeVal.textContent = timeLimit;

    if (iframe && currentDriveId) {
      iframe.src = `https://drive.google.com/file/d/${currentDriveId}/preview`;
    }

    if (btnBvt) btnBvt.href = bvt || '#';
    if (btnSolution) btnSolution.href = solution || '#';
    if (btnRanking) btnRanking.href = ranking || '#';

    if (btnDriveLink && currentDriveId) {
      btnDriveLink.href = `https://drive.google.com/file/d/${currentDriveId}/view?usp=sharing`;
    }

    currentExamHash = getExamHash(currentExamTitle);
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

  // TẢI FILE PDF TRỰC TIẾP TỪ DRIVE SỬ DỤNG LINK GOOGLE CONTENT HỢP LỆ (KHÔNG BỊ CHẶN CORS)
  async function loadPdfDocument(driveId) {
    currentPdfDocument = null;
    renderStatus.textContent = 'Đang kết nối và tải bài thi từ Google Drive...';
    progressBarBox.style.display = 'block';
    progressBarFill.style.width = '20%';

    const directDriveUrl = `https://lh3.googleusercontent.com/d/${driveId}`;
    const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(`https://drive.google.com/uc?export=download&id=${driveId}`)}`;

    try {
      // Cách 1: Thử lấy trực tiếp
      const loadingTask = pdfjsLib.getDocument(directDriveUrl);
      currentPdfDocument = await loadingTask.promise;
    } catch (err1) {
      try {
        // Cách 2: Qua CORS Proxy dự phòng
        const loadingTask2 = pdfjsLib.getDocument(corsProxyUrl);
        currentPdfDocument = await loadingTask2.promise;
      } catch (err2) {
        console.error('Drive Load Error:', err2);
      }
    }

    progressBarFill.style.width = '100%';
    setTimeout(() => { progressBarBox.style.display = 'none'; }, 300);

    if (currentPdfDocument) {
      renderStatus.textContent = `Tải file thành công! Tổng số: ${currentPdfDocument.numPages} trang. Bấm "Chuyển Đổi & Xem Trước" để xuất ảnh.`;
    } else {
      renderStatus.textContent = 'Không thể tải trực tiếp file PDF này do quyền truy cập riêng tư của Google Drive. Vui lòng mở nút Google Drive để tải về thủ công.';
    }
  }

  // SỰ KIỆN BẤM NÚT PDF TO IMG
  if (btnPdfToImg) {
    btnPdfToImg.addEventListener('click', () => {
      if (!currentDriveId) {
        showToast('Vui lòng chọn bài thi trước!');
        return;
      }

      modalContainer.classList.add('show');
      imagesPreviewGrid.innerHTML = '';
      btnDownloadZip.style.display = 'none';
      
      loadPdfDocument(currentDriveId);
    });
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      modalContainer.classList.remove('show');
    });
  }

  function parsePageRanges(inputStr, totalPages) {
    const pages = new Set();
    const str = inputStr.trim().toLowerCase();

    if (str === 'all' || str === '') {
      for (let i = 1; i <= totalPages; i++) pages.add(i);
      return Array.from(pages);
    }

    const parts = str.split(',');
    parts.forEach(part => {
      const p = part.trim();
      if (p.includes('-')) {
        const [start, end] = p.split('-').map(n => parseInt(n, 10));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(totalPages, end); i++) {
            pages.add(i);
          }
        }
      } else {
        const pageNum = parseInt(p, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
          pages.add(pageNum);
        }
      }
    });

    return Array.from(pages).sort((a, b) => a - b);
  }

  // THỰC HIỆN XUẤT ÁNH
  if (btnRenderPages) {
    btnRenderPages.addEventListener('click', async () => {
      if (!currentPdfDocument) {
        alert('File PDF chưa tải xong hoặc không thể truy cập! Vui lòng thử lại sau.');
        return;
      }

      const totalPages = currentPdfDocument.numPages;
      const targetPages = parsePageRanges(pageRangeInput.value, totalPages);

      if (targetPages.length === 0) {
        alert('Phạm vi trang không hợp lệ!');
        return;
      }

      const format = imgFormatSelect.value; // png / jpeg
      const scale = parseFloat(imgDpiSelect.value); // 1.5, 2.0, 3.0

      imagesPreviewGrid.innerHTML = '';
      renderedImagesData = [];
      btnDownloadZip.style.display = 'none';
      progressBarBox.style.display = 'block';

      for (let i = 0; i < targetPages.length; i++) {
        const pageNum = targetPages[i];
        const percent = Math.round(((i + 1) / targetPages.length) * 100);
        
        progressBarFill.style.width = `${percent}%`;
        renderStatus.textContent = `Đang xử lý xuất ảnh trang ${pageNum} / ${totalPages} (${percent}%)...`;

        const page = await currentPdfDocument.getPage(pageNum);
        const viewport = page.getViewport({ scale: scale });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Vẽ phông trắng cho JPG để tránh bị đen
        if (format === 'jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        await page.render({ canvasContext: ctx, viewport: viewport }).promise;

        const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
        const imgDataUrl = canvas.toDataURL(mimeType, 0.92);

        const card = document.createElement('div');
        card.className = 'pdf-page-card';

        const img = document.createElement('img');
        img.src = imgDataUrl;
        img.alt = `Trang ${pageNum}`;

        const label = document.createElement('span');
        label.className = 'page-label';
        label.textContent = `Trang ${pageNum} (${format.toUpperCase()})`;

        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'btn-download-single';
        downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i> Tải Ảnh Trang ${pageNum}`;
        downloadBtn.addEventListener('click', () => {
          const a = document.createElement('a');
          a.href = imgDataUrl;
          a.download = `${currentExamTitle}_Trang_${pageNum}.${format}`;
          a.click();
        });

        card.appendChild(img);
        card.appendChild(label);
        card.appendChild(downloadBtn);
        imagesPreviewGrid.appendChild(card);

        renderedImagesData.push({ pageNum, dataUrl: imgDataUrl, format });
      }

      progressBarBox.style.display = 'none';
      renderStatus.textContent = `Hoàn thành! Đã chuyển đổi thành công ${targetPages.length} trang dạng ${format.toUpperCase()}.`;
      if (renderedImagesData.length > 0) {
        btnDownloadZip.style.display = 'inline-flex';
      }
    });
  }

  // TẢI FILE ZIP
  if (btnDownloadZip) {
    btnDownloadZip.addEventListener('click', () => {
      if (renderedImagesData.length === 0) return;

      const zip = new JSZip();
      renderedImagesData.forEach(item => {
        const base64Data = item.dataUrl.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
        zip.file(`${currentExamTitle}_Trang_${item.pageNum}.${item.format}`, base64Data, { base64: true });
      });

      zip.generateAsync({ type: 'blob' }).then(content => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = `${currentExamTitle}_Full_Images.zip`;
        a.click();
      });
    });
  }

  // AUTO SELECT EXAM
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

  // FACEBOOK SHARE
  if (btnShareFb) {
    btnShareFb.addEventListener('click', () => {
      const shareUrl = encodeURIComponent(window.location.href);
      const fbShareWindow = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
      window.open(fbShareWindow, '_blank', 'width=600,height=500');
    });
  }

  // COPY LINK
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
