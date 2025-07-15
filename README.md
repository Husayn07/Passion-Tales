# Passion-Tales


We are going to write a script that activates filters based on the URL parameters.
 The idea is that when the page loads, it checks the URL for any filter parameters (e.g., ?category=romantic) and then applies that filter.
 Steps:
 1. Parse the URL parameters to get the filter value.
 2. If a filter is present, find the corresponding filter button and mark it as active (e.g., add an active class).
 3. Then filter the videos accordingly.
 We'll assume that the videos are loaded from an array or an API. For simplicity, let's assume we have an array of video objects.
 We'll create:
   - A function to parse URL parameters.
   - A function to filter the videos by a given category.
   - A function to render the filtered videos.
 Also, we'll add event listeners to the filter buttons to update the URL and re-render the videos.
 Note: We are going to integrate this into the existing script in the HTML.
 Let's modify the existing script in the HTML by adding the following:

Here's a script that activates filters based on URL parameters and integrates with your existing code:
html

<script>
// ... existing script code above ...

// New Filter Functionality
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

// ... rest of your existing script below ...
</script>

To make this work, you'll need to:

    Update your HTML structure for video cards to include data attributes:

html

<div class="video-card" data-category="romantic">
    <!-- card content -->
</div>

    Add a video description element in your video cards:

html

<div class="video-info">
    <h3 class="video-title">Title</h3>
    <p class="video-description">Description text</p>
    <!-- other metadata -->
</div>

    Add CSS for active filter state:

css

.filter-btn.active {
    background-color: #ff4c68;
    color: white;
}

Key features of this implementation:

    URL parameter handling:

    ?category=romantic will automatically filter videos

    ?q=search+term will perform a text search

    Filter types:

    Category filters (buttons at top)

    Search filter (through URL or search box)

    URL management:

    Updates URL without page reload when filters change

    Maintains browser history

    Allows bookmarking/sharing filtered views

    Search integration:

    Works with both URL parameters and search box

    Searches in titles and descriptions

    UI feedback:

    Active filter buttons are highlighted

    Non-matching videos are hidden

To use this:

    Add category buttons to your page by calling initFilters()

    Make sure each video card has a data-category attribute

    The search will automatically work with URL parameters

Example URLs:

    videos.html?category=lesbian - Shows only lesbian category videos

    videos.html?q=beach - Shows videos with "beach" in title/description

    videos.html?category=gay&q=summer - Combined category and text filter

For the search box to work with this system, modify your existing search handler:
javascript

// Replace your existing search handler with:
searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query !== '') {
        const url = new URL(window.location);
        url.searchParams.set('q', query);
        window.location.href = url;
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query !== '') {
            const url = new URL(window.location);
            url.searchParams.set('q', query);
            window.location.href = url;
        }
    }
});

This implementation gives you a complete filtering system that:

    Responds to URL parameters on page load

    Updates the URL when filters change

    Provides clear visual feedback

    Works with both category filters and text search

    Maintains browser history

    Allows deep linking to filtered views