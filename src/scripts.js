        // DOM Elements
        const storiesGrid = document.getElementById('storiesGrid');
        const filtersContainer = document.getElementById('filtersContainer');
        const loadMoreBtn = document.getElementById('loadMoreBtn');

        // State variables
        let currentPage = 1;
        let currentCategory = 'all';
        let isLoading = false;
        let categoriesData = [];

        // Initialize the application
        async function init() {
            // Check if age is verified (simplified for demo)
            if (!localStorage.getItem('ageVerified')) {
                if (!confirm("This website contains adult content. Are you 18 or older?")) {
                    window.location.href = 'https://www.google.com';
                    return;
                }
                localStorage.setItem('ageVerified', 'true');
            }

            await loadCategories();
            loadStories();
            
            // Set up infinite scroll
            window.addEventListener('scroll', handleScroll);
        }

        // Load and display category filters
        async function loadCategories() {
            try {
                const response = await fetch('data/categories.json');
                const data = await response.json();
                categoriesData = data.categories;
                
                // Create filter buttons
                filtersContainer.innerHTML = categoriesData.map(cat => `
                    <button class="filter-btn ${cat.slug === 'all' ? 'active' : ''}" 
                            data-category="${cat.slug}"
                            style="${cat.slug !== 'all' ? `--cat-color: ${cat.color}` : ''}"
                            aria-label="Filter by ${cat.name}">
                        ${cat.name} <span class="count">(${cat.count})</span>
                    </button>
                `).join('');
                
                // Add event listeners to filter buttons
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        currentCategory = this.dataset.category;
                        currentPage = 1;
                        
                        // Update active state
                        document.querySelectorAll('.filter-btn').forEach(b => 
                            b.classList.remove('active'));
                        this.classList.add('active');
                        
                        // Load filtered stories
                        loadStories();
                    });
                });
            } catch (error) {
                console.error('Error loading categories:', error);
                // Fallback UI
                filtersContainer.innerHTML = `
                    <button class="filter-btn active" data-category="all">All</button>
                    <button class="filter-btn" data-category="first-time">First Time</button>
                    <button class="filter-btn" data-category="workplace">Workplace</button>
                `;
                
                // Add event listeners to fallback buttons
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        currentCategory = this.dataset.category;
                        currentPage = 1;
                        
                        document.querySelectorAll('.filter-btn').forEach(b => 
                            b.classList.remove('active'));
                        this.classList.add('active');
                        
                        loadStories();
                    });
                });
            }
        }

        // Load stories based on current category and page
        async function loadStories() {
            if (isLoading) return;
            
            isLoading = true;
            if (loadMoreBtn) {
                loadMoreBtn.disabled = true;
                loadMoreBtn.textContent = 'Loading...';
            }
            
            try {
                let url;
                if (currentCategory === 'all') {
                    url = `data/stories-${currentPage}.json`;
                } else {
                    // Find the category object to get the correct slug
                    const category = categoriesData.find(c => c.slug === currentCategory);
                    url = `data/stories-${category.slug}-${currentPage}.json`;
                }
                
                console.log("Fetching:", url); // For debugging
                
                const response = await fetch(url);
                
                // If 404 (file doesn't exist), hide load more button
                if (response.status === 404) {
                    if (loadMoreBtn) loadMoreBtn.style.display = 'none';
                    return;
                }
                
                const data = await response.json();
                const stories = data.stories;
                
                // Clear grid if it's the first page
                if (currentPage === 1) {
                    storiesGrid.innerHTML = '';
                }
                
                // Display stories
                displayStories(stories);
                
                // Show load more button if there might be more stories
                if (stories.length >= 4 && loadMoreBtn) {
                    loadMoreBtn.style.display = 'block';
                } else if (loadMoreBtn) {
                    loadMoreBtn.style.display = 'none';
                }
            } catch (error) {
                console.error('Error loading stories:', error);
                
                // Fallback content for debugging
                if (currentPage === 1) {
                    storiesGrid.innerHTML = `
                        <div class="error">
                            <p>Could not load stories. Please try again later.</p>
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

        // Display stories in the grid
        function displayStories(stories) {
            const fragment = document.createDocumentFragment();
            
            stories.forEach(story => {
                const storyCard = document.createElement('a');
                storyCard.href = `story.html?id=${story.id}`;
                storyCard.className = 'story-card';
                storyCard.dataset.category = story.category;
                storyCard.setAttribute('aria-label', `Read story: ${story.title}`);
                
                // Find category color
                const category = categoriesData.find(c => c.slug === story.category) || {};
                
                storyCard.innerHTML = `
                    <div class="card-image">
                        <img src="${story.image}" alt="${story.title}" loading="lazy">
                    </div>
                    <div class="card-content">
                        <span class="card-category" style="background-color: ${category.color || '#cc3366'}">
                            ${story.category.replace(/-/g, ' ')}
                        </span>
                        <h3 class="card-title">${story.title}</h3>
                        <p class="card-excerpt">${story.excerpt}</p>
                        <div class="card-meta">
                            <span class="card-author">${story.author}</span>
                            <span class="card-length">⏱️ ${story.length}</span>
                        </div>
                    </div>
                `;
                
                fragment.appendChild(storyCard);
            });
            
            storiesGrid.appendChild(fragment);
        }

        // Handle infinite scroll
        function handleScroll() {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
                currentPage++;
                loadStories();
            }
        }

        // Load more button handler
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                currentPage++;
                loadStories();
            });
        }

        // Initialize the app when DOM is loaded
        document.addEventListener('DOMContentLoaded', init);