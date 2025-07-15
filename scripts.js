(() => {
  const API_BASE = 'data';
  const PAGE_SIZE = 4;
  let page = 1, category = 'all', loading = false;

  const dom = {
    filters: document.querySelector('.filters'),
    grid:    document.getElementById('storiesGrid'),
    btn:     document.getElementById('loadMoreBtn')
  };

  function fetchJSON(path) {
    return fetch(path).then(res => res.ok ? res.json() : Promise.reject(res.status));
  }

  async function init() {
    try {
      await verifyAge();
      const { categories } = await fetchJSON(`${API_BASE}/categories.json`);
      renderFilters(categories);
      loadStories();
      window.addEventListener('scroll', throttle(onScroll, 200));
      dom.btn.addEventListener('click', onLoadMore);
    } catch (e) {
      console.error(e);
    }
  }

  function verifyAge() {
    if (!localStorage.getItem('ageVerified')) {
      return new Promise(res => {
        const ok = confirm('This website contains adult content. Are you 18 or older?');
        if (!ok) return window.location.replace('https://www.google.com');
        localStorage.setItem('ageVerified','true');
        res();
      });
    }
    return Promise.resolve();
  }

  function renderFilters(cats) {
    const frag = document.createDocumentFragment();
    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.slug = cat.slug;
      btn.innerHTML = `${cat.name} <span class="count">(${cat.count})</span>`;
      if (cat.slug === 'all') btn.classList.add('active');
      frag.append(btn);
    });
    dom.filters.append(frag);
    dom.filters.addEventListener('click', onFilterClick);
  }

  function onFilterClick(e) {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    category = btn.dataset.slug;
    page = 1;
    [...dom.filters.children].forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    loadStories(true);
  }

  async function loadStories(clear=false) {
    if (loading) return;
    loading = true;
    dom.btn.disabled = true;
    dom.btn.textContent = 'Loading...';

    try {
      const path = `${API_BASE}/stories-${category}-${page}.json`;
      const { stories } = await fetchJSON(path);
      if (clear) dom.grid.innerHTML = '';
      appendStories(stories);
      dom.btn.style.display = stories.length === PAGE_SIZE ? '' : 'none';
    } catch (err) {
      dom.btn.style.display = 'none';
    } finally {
      loading = false;
      dom.btn.disabled = false;
      dom.btn.textContent = 'Load More Stories';
    }
  }

  function appendStories(list) {
    const frag = document.createDocumentFragment();
    list.forEach(s=>{
      const a = document.createElement('a');
      a.href = `story.html?id=${s.id}`;
      a.className = 'story-card';
      a.innerHTML = `
        <div class="card-image">
          <img src="${s.image}" alt="${s.title}" loading="lazy" onerror="this.src='fallback.jpg'"/>
        </div>
        <div class="card-content">
          <span class="card-category">${s.category.replace('-', ' ')}</span>
          <h3 class="card-title" title="${s.title}">${s.title}</h3>
          <p class="card-excerpt">${s.excerpt}</p>
          <div class="card-meta">
            <span>${s.author}</span><span>⏱️ ${s.length}</span>
          </div>
        </div>`;
      frag.append(a);
    });
    dom.grid.append(frag);
  }

  function onLoadMore() {
    page++; loadStories();
  }

  function onScroll() {
    if (window.innerHeight + scrollY >= document.body.offsetHeight - 400) onLoadMore();
  }

  function throttle(fn, wait) {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= wait) { fn(...args); last = now; }
    };
  }

  document.addEventListener('DOMContentLoaded', init);
})();