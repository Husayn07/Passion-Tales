// DOM Elements
const videosGrid = document.getElementById('videosGrid');
const filtersContainer = document.getElementById('filtersContainer');
const loadMoreBtn = document.getElementById('loadMoreBtn');

// State variables
let currentPage = 1;
let currentCategory = 'all';
let isLoading = false;
let categoriesData = [];

// Initialize the application
async function init() {
    if (!localStorage.getItem('ageVerified')) {
        if (!confirm("This website contains adult content. Are you 18 or older?")) {
            window.location.href = 'https://www.google.com';
            return;
        }
        localStorage.setItem('ageVerified', 'true');
    }

    await loadCategories();
    loadVideos();

    window.addEventListener('scroll', handleScroll);
}

// Load and display category filters
async function loadCategories() {
    try {
        const response = await fetch('data/videos/categories.json');
        const data = await response.json();
        categoriesData = data.categories;

        filtersContainer.innerHTML = categoriesData.map(cat => `
            <button class="filter-btn ${cat.slug === 'all' ? 'active' : ''}" 
                    data-category="${cat.slug}"
                    style="${cat.slug !== 'all' ? `--cat-color: ${cat.color}` : ''}">
                ${cat.name} <span class="count">(${cat.count})</span>
            </button>
        `).join('');

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                currentCategory = this.dataset.category;
                currentPage = 1;

                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                loadVideos();
            });
        });
    } catch (error) {
        console.error('Error loading categories:', error);
        filtersContainer.innerHTML = `
            <button class="filter-btn active" data-category="all">All</button>
            <button class="filter-btn" data-category="romance">Romance</button>
            <button class="filter-btn" data-category="office">Office</button>
        `;
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                currentCategory = this.dataset.category;
                currentPage = 1;

                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                loadVideos();
            });
        });
    }
}

// Load videos based on current category and page
async function loadVideos() {
    if (isLoading) return;

    isLoading = true;
    if (loadMoreBtn) {
        loadMoreBtn.disabled = true;
        loadMoreBtn.textContent = 'Loading...';
    }

    try {
        let url;
        if (currentCategory === 'all') {
            url = `data/videos/videos-${currentPage}.json`;
        } else {
            const category = categoriesData.find(c => c.slug === currentCategory);
            url = `data/videos/videos-${category.slug}-${currentPage}.json`;
        }

        const response = await fetch(url);
        if (response.status === 404) {
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            return;
        }

        const data = await response.json();
        const videos = data.videos;

        if (currentPage === 1) {
            videosGrid.innerHTML = '';
        }

        displayVideos(videos);

        if (videos.length >= 4 && loadMoreBtn) {
            loadMoreBtn.style.display = 'block';
        } else if (loadMoreBtn) {
            loadMoreBtn.style.display = 'none';
        }

    } catch (error) {
        console.error('Error loading videos:', error);
        if (currentPage === 1) {
            videosGrid.innerHTML = `
                <div class="error">
                    <p>Could not load videos. Try again later.</p>
                    <p>Error: ${error.message}</p>
                </div>
            `;
        }
    } finally {
        isLoading = false;
        if (loadMoreBtn) {
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Load More Stories';
        }
    }
}

// Display videos in the grid
function displayVideos(videos) {
    const fragment = document.createDocumentFragment();

    videos.forEach(video => {
        const videoCard = document.createElement('a');
        videoCard.href = `video.html?id=${video.id}`;
        videoCard.className = 'video-card';
        videoCard.dataset.category = video.category;

        const category = categoriesData.find(c => c.slug === video.category) || {};

        videoCard.innerHTML = `
            <div class="card-video">
                <video src="${video.videoUrl}" poster="${video.poster}" preload="metadata" muted></video>
            </div>
            <div class="card-content">
                <span class="card-category" style="background-color: ${category.color || '#cc3366'}">
                    ${video.category.replace(/-/g, ' ')}
                </span>
                <h3 class="card-title">${video.title}</h3>
                <p class="card-description">${video.description || ''}</p>
                <div class="card-meta">
                    <span class="card-author">${video.uploader}</span>
                    <span class="card-length">⏱️ ${video.length}</span>
                </div>
            </div>
        `;

        fragment.appendChild(videoCard);
    });

    videosGrid.appendChild(fragment);
}

// Infinite scroll handler
function handleScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        currentPage++;
        loadVideos();
    }
}

// Load more button handler
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        loadVideos();
    });
}

document.addEventListener('DOMContentLoaded', init);
