const videoElement = document.getElementById('input_video');
const canvasElement = document.getElementById('output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const lineWidthSelect = document.getElementById('lineWidth');
const goToPostcardBtn = document.getElementById('goToPostcard');

let brushColor = colorPicker.value;
let brushSize = parseInt(lineWidthSelect.value);
let prevX = null,
  prevY = null;
let isErasing = false;

colorPicker.addEventListener('input', (e) => {
  brushColor = e.target.value;
});

lineWidthSelect.addEventListener('change', (e) => {
  brushSize = parseInt(e.target.value);
});

goToPostcardBtn.addEventListener('click', () => {
  const answers = {};
  document.querySelectorAll('.qa-input').forEach((ta) => {
    answers[ta.dataset.id] = ta.value;
  });
  localStorage.setItem('qaAnswers', JSON.stringify(answers));
  localStorage.setItem('drawing', canvasElement.toDataURL('image/png'));
  window.location.href = '../03-post-card/index.html';
});

const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});
hands.setOptions({
  maxNumHands: 1, // 한 손만 써도 OK
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7,
});

// 모든 손가락이 펴져 있는지 확인
function isOpenHand(landmarks) {
  return [8, 12, 16, 20].every(
    (tip) => landmarks[tip].y < landmarks[tip - 2].y
  );
}

function isFist(landmarks) {
  return [8, 12, 16, 20].every(
    (tip) => landmarks[tip].y > landmarks[tip - 2].y
  );
}

function isEraserGesture(landmarks) {
  return (
    landmarks[8].y < landmarks[6].y && // 검지 up
    landmarks[12].y < landmarks[10].y // 중지 up
  );
}

function isDrawingGesture(landmarks) {
  return (
    landmarks[8].y < landmarks[6].y && // 검지 up
    landmarks[12].y > landmarks[10].y // 중지 down
  );
}

hands.onResults((results) => {
  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    prevX = prevY = null;
    return;
  }
  const lm = results.multiHandLandmarks[0];

  // ← 맨 처음: open-hand이면 캔버스 클리어
  if (isOpenHand(lm)) {
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    prevX = prevY = null;
    return;
  }

  // 주먹: 그리기/지우기 모두 멈춤
  if (isFist(lm)) {
    prevX = prevY = null;
    return;
  }

  // 지우개 모드 & 그리기 모드 설정
  isErasing = isEraserGesture(lm);

  if (!isErasing && !isDrawingGesture(lm)) {
    prevX = prevY = null;
    return;
  }

  // 좌표 변환
  const x = lm[8].x * canvasElement.width;
  const y = lm[8].y * canvasElement.height;

  if (prevX != null && prevY != null) {
    if (isErasing) {
      canvasCtx.save();
      canvasCtx.globalCompositeOperation = 'destination-out';
      canvasCtx.beginPath();
      canvasCtx.moveTo(prevX, prevY);
      canvasCtx.lineTo(x, y);
      canvasCtx.lineWidth = brushSize * 2.5;
      canvasCtx.lineCap = 'round';
      canvasCtx.stroke();
      canvasCtx.restore();
    } else {
      canvasCtx.save();
      canvasCtx.globalCompositeOperation = 'source-over';
      canvasCtx.beginPath();
      canvasCtx.moveTo(prevX, prevY);
      canvasCtx.lineTo(x, y);
      canvasCtx.strokeStyle = brushColor;
      canvasCtx.lineWidth = brushSize;
      canvasCtx.lineCap = 'round';
      canvasCtx.stroke();
      canvasCtx.restore();
    }
  }

  prevX = x;
  prevY = y;
});

const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 640,
  height: 480,
});
camera.start();
