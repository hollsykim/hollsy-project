window.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('archiveGrid');
  const modal = document.getElementById('previewModal');
  const overlay = modal.querySelector('.overlay');
  const closeBtn = document.getElementById('closeModal');
  const previewImg = document.getElementById('previewImage');
  const previewText = document.getElementById('previewText');
  const goHomeBtn = document.getElementById('goHomeBtn');

  // Home button working
  if (homeBtn) {
    homeBtn.addEventListener('click', () => {
      window.location.href = '../index.html';
    });
  }

  // Load postcard archives
  const archives = JSON.parse(localStorage.getItem('postcardArchives') || '[]');

  if (!archives.length) return;

  // Render archive cards
  archives.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${item.image}" alt="Postcard ${idx + 1}"/>
      <div class="meta">
        ${new Date(item.timestamp).toLocaleString()}
        <button class="delete-btn" data-index="${idx}">🗑️</button>
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-btn')) return;
      previewImg.src = item.image;
      previewText.textContent = Object.entries(item.answers)
        .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
        .join('\n\n');
      modal.classList.remove('hidden');
    });

    grid.append(card);
  });

  // Delete archive
  grid.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
      const index = parseInt(e.target.dataset.index);
      archives.splice(index, 1);
      localStorage.setItem('postcardArchives', JSON.stringify(archives));
      location.reload();
    }
  });

  // Modal close
  [closeBtn, overlay].forEach((el) =>
    el.addEventListener('click', () => modal.classList.add('hidden'))
  );
});
