window.addEventListener('DOMContentLoaded', () => {
  // ==== 요소 캐시 ====
  const canvas = document.getElementById('postcardCanvas');
  const ctx = canvas.getContext('2d');
  const textColorInput = document.getElementById('textColor');
  const canvasBgColorInput = document.getElementById('canvasBgColor'); // (2)와 동일하게 ID 맞춤
  const stampDateInput = document.getElementById('stampDate');
  const stampTextInput = document.getElementById('stampText');
  const stampBtn = document.getElementById('stampBtn');
  const backToDrawingBtn = document.getElementById('backToDrawingBtn');
  const saveJpgBtn = document.getElementById('saveJpgBtn');
  const savePngBtn = document.getElementById('savePngBtn');
  const toggleBtn = document.getElementById('toggleControlsBtn');
  const controlsBox = document.getElementById('controls');

  // ==== flatpickr(달력) 초기화 ====
  flatpickr(stampDateInput, {
    locale: 'en',
    dateFormat: 'm/d/Y',
  });

  // ==== QA 답변 한 번만 불러오기 ====
  const savedAnswers = localStorage.getItem('qaAnswers');
  const answers = savedAnswers
    ? JSON.parse(savedAnswers)
    : { qa1: '', qa2: '', qa3: '', qa4: '' };

  // ==== 배경 이미지 로드 (1번 코드에서 가져온 배경) ====
  const backgroundImg = new Image();
  backgroundImg.src = 'assets/03/BG-66.png';
  let isBgLoaded = false;
  backgroundImg.onload = () => {
    isBgLoaded = true;
    drawCanvas();
  };

  // ==== 드로잉 이미지 로드 ====
  const imageData = localStorage.getItem('drawing');
  const img = new Image();
  let isDrawingLoaded = false;
  img.onload = () => {
    isDrawingLoaded = true;
    drawCanvas();
  };
  if (imageData) {
    img.src = imageData;
  } else {
    alert('No drawing found. Please draw something first.');
  }

  // ==== 컨트롤 박스 토글 ====
  toggleBtn?.addEventListener('click', () => {
    controlsBox?.classList.toggle('open');
  });

  // ==== 줄바꿈 헬퍼 함수 ====
  function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      if (ctx.measureText(testLine).width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }

  // ==== 메인 그리기 함수 ====
  function drawCanvas() {
    // 1) 캔버스 초기화 + 배경색 채우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = canvasBgColorInput.value || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2) 배경 이미지 (로드 완료 시에만)
    if (isBgLoaded) {
      ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
    }

    // 3) 드로잉 이미지 (로드 완료 시에만) — 손그림을 가로로 뒤집어서 그리기
    if (isDrawingLoaded) {
      ctx.save();
      // 캔버스 폭만큼 이동한 뒤
      ctx.translate(canvas.width, 0);
      // 가로축 뒤집기
      ctx.scale(-1, 1);
      // 뒤집힌 좌표계에 그림 그리기
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    }

    // 4) QA 4분면 텍스트 그리기
    const padding = 20;
    const lineHeight = 28;
    const midX = canvas.width / 2;
    const midY = canvas.height / 2;

    ctx.save();
    ctx.font = 'bold 24px serif';
    ctx.fillStyle = textColorInput.value;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    wrapText(
      ctx,
      answers.qa1 || '',
      padding,
      padding,
      midX - padding * 2,
      lineHeight
    );
    wrapText(
      ctx,
      answers.qa2 || '',
      midX + padding,
      padding,
      midX - padding * 2,
      lineHeight
    );
    wrapText(
      ctx,
      answers.qa3 || '',
      padding,
      midY + padding,
      midX - padding * 2,
      lineHeight
    );
    wrapText(
      ctx,
      answers.qa4 || '',
      midX + padding,
      midY + padding,
      midX - padding * 2,
      lineHeight
    );

    ctx.restore();
  }

  // ==== 배경/텍스트 색 변경 리스너 ====
  //  → 색을 바꿀 때마다 drawCanvas()만 다시 호출, 기존 드로잉과 QA는 유지
  canvasBgColorInput.addEventListener('input', drawCanvas);
  textColorInput.addEventListener('input', drawCanvas);

  // ==== 초기 렌더 한 번 강제 호출 ====
  drawCanvas();

  // ==== Stamp 기능 (오른쪽 하단 사각 도장 + 텍스트/날짜) ====
  stampBtn.addEventListener('click', () => {
    const textVal = stampTextInput.value.trim() || '–';
    const rawDate = stampDateInput.value;
    const dateStr = rawDate
      ? new Date(rawDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '–';

    const w = 240;
    const h = 120;
    const x = canvas.width - w - 20;
    const y = canvas.height - h - 20;
    const pad = 12;
    const midY = pad + 24;

    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = '#d32f2f';
    ctx.fillStyle = '#d32f2f';
    ctx.lineWidth = 2;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // 외곽 사각형
    ctx.strokeRect(0, 0, w, h);
    // 분할선
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();

    // 헤더 (대문자 + Courier New, bold)
    ctx.font = '16px "Courier New", bold';
    ctx.fillText('DRAWN LETTER', pad, midY / 2);

    // Stamp 텍스트
    ctx.font = '16px "Nanum Myeongjo", serif';
    ctx.fillText(textVal, pad, midY + pad);

    // Stamp 날짜
    ctx.fillText(dateStr, pad, midY + pad + 24);
    ctx.restore();
  });

  // ==== Back to Drawing ====
  backToDrawingBtn.addEventListener('click', () => {
    window.location.href = '../04-archives/index.html';
  });

  // ==== Save as JPG ====
  saveJpgBtn.addEventListener('click', () => {
    console.log('👉 Saving JPG…');
    const link = document.createElement('a');
    link.download = 'postcard.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  });

  // ==== Save as PNG ====
  savePngBtn.addEventListener('click', () => {
    console.log('👉 Saving PNG…');
    const link = document.createElement('a');
    link.download = 'postcard.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
  const sendBtn = document.getElementById('sendToArchiveBtn');

  sendBtn.addEventListener('click', () => {
    // 엽서 이미지 데이터 생성
    const imgDataUrl = canvas.toDataURL('image/png');

    // 현재 저장된 archive 불러오기
    const archives = JSON.parse(
      localStorage.getItem('postcardArchives') || '[]'
    );

    // 새 엽서 데이터 구성
    const newPostcard = {
      image: imgDataUrl,
      answers: answers,
      timestamp: Date.now(),
    };

    // 저장 및 업데이트
    archives.push(newPostcard);
    localStorage.setItem('postcardArchives', JSON.stringify(archives));

    alert('✅ 편지가 아카이브에 저장되었습니다!');
  });
});
