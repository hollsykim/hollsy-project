window.addEventListener('DOMContentLoaded', () => {
  const stampImage = document.getElementById('stamp-image');
  const infoModal = document.getElementById('info-modal');
  const modalClose = document.getElementById('modal-close');
  const startDrawImg = document.getElementById('start-draw-img');
  const startDrawingBtn = document.getElementById('startDrawingBtn');

  // 1) 도장 이미지 클릭 → 모달 열기
  stampImage.addEventListener('click', () => {
    infoModal.classList.remove('hidden');
  });

  // 2) 모달 닫기 버튼 클릭 → 모달 닫기
  modalClose.addEventListener('click', () => {
    infoModal.classList.add('hidden');
  });

  // 3) 모달 영역 바깥을 클릭해도 모달 닫기
  infoModal.addEventListener('click', (e) => {
    // 만약 클릭한 대상이 모달 콘텐츠(inside)가 아니라면 닫기
    if (e.target === infoModal) {
      infoModal.classList.add('hidden');
    }
  });

  // ✅ Start Drawing 버튼 클릭 → 페이지 이동
  startDrawingBtn.addEventListener('click', () => {
    window.location.href = './02-hand-draw/index_2.html';
  });
});
