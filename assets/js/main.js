// Cấu hình thư viện PDF.js Worker
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
  const renderStatus = document.getElementById('pdf-render-status');
  const imagesPreviewGrid = document.getElementById('pdf-images-preview-grid');

  const toastEl = document.getElementById('toast-message');
  const toastText = document.getElementById('toast-text');

  let currentExamHash = '';
  let currentDriveId = '';
  let currentExamTitle = '';
  let currentPdfDocument = null;
  let renderedCanvases = [];

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

  // KHỦNG XỬ LÝ CHUYỂN PDF THÀNH ẢNH DÙNG PDF.JS
  if (btnPdfToImg) {
    btnPdfToImg.addEventListener('click', () => {
      if (!currentDriveId) {
        showToast('Vui lòng chọn bài thi trước!');
        return;
      }

      modalContainer.classList.add('show');
      imagesPreviewGrid.innerHTML = '';
      btnDownloadZip.style.display = 'none';
      renderStatus.textContent = 'Đang tải tệp PDF từ Google Drive...';

      // Tạo URL tải file PDF trực tiếp thông qua Google Drive Export
      const pdfDirectUrl = `https://lh3.googleusercontent.com/u/0/d/${currentDriveId}`;
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://drive.google.com/uc?export=download&id=${currentDriveId}`)}`;

      pdfjsLib.getDocument(proxyUrl).promise.then(pdf => {
        currentPdfDocument = pdf;
        renderStatus.textContent = `Tải thành công! Tệp gồm ${pdf.numPages} trang. Bấm "Xem trước & Tạo ảnh" để bắt đầu.`;
      }).catch(err => {
        console.error(err);
        renderStatus.textContent = 'Không thể tải trực tiếp file PDF này do chính sách bảo mật Google Drive. Bạn có thể mở file trực tiếp trên Drive để tải về.';
      });
    });
  }

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
      modalContainer.classList.remove('show');
    });
  }

  // TÁCH CHUỖI TRANG CẦN XUẤT (vd: 1, 3, 5-7 hoặc all)
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

  // RENDER CÁC TRANG LÊN CANVAS
  if (btnRenderPages) {
    btnRenderPages.addEventListener('click', async () => {
      if (!currentPdfDocument) {
        alert('File PDF chưa được tải xong!');
        return;
      }

      const totalPages = currentPdfDocument.numPages;
      const targetPages = parsePageRanges(pageRangeInput.value, totalPages);

      if (targetPages.length === 0) {
        alert('Phạm vi trang không hợp lệ!');
        return;
      }

      imagesPreviewGrid.innerHTML = '';
      renderedCanvases = [];
      btnDownloadZip.style.display = 'none';

      for (let i = 0; i < targetPages.length; i++) {
        const pageNum = targetPages[i];
        renderStatus.textContent = `Đang chuyển đổi trang ${pageNum} / ${totalPages}...`;

        const page = await currentPdfDocument.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // Tỷ lệ x2 cho ảnh nét

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: ctx, viewport: viewport }).promise;

        const card = document.createElement('div');
        card.className = 'pdf-page-card';

        const label = document.createElement('span');
        label.className = 'page-label';
        label.textContent = `Trang ${pageNum}`;

        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'btn-download-single';
        downloadBtn.innerHTML = `<i class="fa-solid fa-download"></i> Tải ảnh trang ${pageNum}`;
        downloadBtn.addEventListener('click', () => {
          const a = document.createElement('a');
          a.href = canvas.toDataURL('image/png');
          a.download = `${currentExamTitle}_Trang_${pageNum}.png`;
          a.click();
        });

        card.appendChild(canvas);
        card.appendChild(label);
        card.appendChild(downloadBtn);
        imagesPreviewGrid.appendChild(card);

        renderedCanvases.push({ pageNum, canvas });
      }

      renderStatus.textContent = `Đã tạo xong ảnh cho ${targetPages.length} trang được chọn!`;
      if (renderedCanvases.length > 0) {
        btnDownloadZip.style.display = 'inline-flex';
      }
    });
  }

  // TẢI FILE ZIP TOÀN BỘ CÁC TRANG ĐÃ TẠO
  if (btnDownloadZip) {
    btnDownloadZip.addEventListener('click', () => {
      if (renderedCanvases.length === 0) return;

      const zip = new JSZip();
      renderedCanvases.forEach(item => {
        const dataUrl = item.canvas.toDataURL('image/png');
        const base64Data = dataUrl.replace(/^data:image\/(png|jpg);base64,/, "");
        zip.file(`${currentExamTitle}_Trang_${item.pageNum}.png`, base64Data, { base64: true });
      });

      zip.generateAsync({ type: 'blob' }).then(content => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = `${currentExamTitle}_Full_Images.zip`;
        a.click();
      });
    });
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

  // NÚT CHIA SẺ FACEBOOK
  if (btnShareFb) {
    btnShareFb.addEventListener('click', () => {
      const shareUrl = encodeURIComponent(window.location.href);
      const fbShareWindow = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
      window.open(fbShareWindow, '_blank', 'width=600,height=500');
    });
  }

  // NÚT LẤY LIÊN KẾT WEBSITE
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
