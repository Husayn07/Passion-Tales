// DOM Elements
const videosGrid = document.getElementById('videosGrid');
const filtersContainer = document.getElementById('filtersContainer');
const loadMoreBtn = document.getElementById('loadMoreBtn');

// State variables
let currentPage = 1;
let currentCategory = 'all';
let isLoading = false;
let categoriesData = [];

// /////////////////////////intoduction of a script

document.addEventListener('DOMContentLoaded', function() {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFilter = urlParams.get('category');
    const searchQuery = urlParams.get('q');

    // Activate filters if parameters exist
    if (categoryFilter) {
        activateCategoryFilter(categoryFilter);
    }
    
    if (searchQuery) {
        document.querySelector('.search-bar input').value = searchQuery;
        performSearch(searchQuery);
    }

    // Add event listeners to filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            setCategoryFilter(category);
        });
    });
});

// Filter activation functions
function activateCategoryFilter(category) {
    // Update UI
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Filter videos
    const videos = document.querySelectorAll('.video-card');
    videos.forEach(video => {
        const videoCategory = video.dataset.category.toLowerCase();
        if (category === 'all' || videoCategory === category) {
            video.style.display = 'block';
        } else {
            video.style.display = 'none';
        }
    });
}

function setCategoryFilter(category) {
    // Update URL without reloading page
    const url = new URL(window.location);
    url.searchParams.set('category', category);
    window.history.pushState({}, '', url);
    
    // Apply filter
    activateCategoryFilter(category);
}

function performSearch(query) {
    const videos = document.querySelectorAll('.video-card');
    const searchTerm = query.toLowerCase();
    
    videos.forEach(video => {
        const title = video.querySelector('.video-title').textContent.toLowerCase();
        const description = video.querySelector('.video-description').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            video.style.display = 'block';
        } else {
            video.style.display = 'none';
        }
    });
}

// Initialize filter buttons
function initFilters() {
    const filtersContainer = document.getElementById('filtersContainer');
    const categories = ['all', 'romantic', 'bdsm', 'lesbian', 'gay', 'group', 'fantasy'];
    
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.category = category;
        btn.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        filtersContainer.appendChild(btn);
    });
}

// Call this in your existing script where you initialize the page
initFilters();


//////////////////////////end of script 


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
