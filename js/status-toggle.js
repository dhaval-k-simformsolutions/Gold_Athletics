const statuses = ['Following', 'Not Following', 'Partially Following'];
const colors = {
    'Following': '#4CAF50', // Will match status-following
    'Not Following': '#f44336', // Will match status-not-following
    'Partially Following': '#FFC107' // Will match status-partially-following
};

// Close all dropdowns when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.matches('.status-button') && !e.target.matches('.status-dropdown-item')) {
        const dropdowns = document.getElementsByClassName('status-dropdown-content');
        Array.from(dropdowns).forEach(dropdown => {
            dropdown.classList.remove('show');
        });
    }
});

function toggleDropdown(button) {
    const dropdown = button.nextElementSibling;
    const allDropdowns = document.getElementsByClassName('status-dropdown-content');
    
    // Close all other dropdowns
    Array.from(allDropdowns).forEach(d => {
        if (d !== dropdown) {
            d.classList.remove('show');
        }
    });
    
    dropdown.classList.toggle('show');
}

function setStatus(button, newStatus, originalStatus, dropdown) {
    // Update button color and text by setting the appropriate status class
    const statusClass = `status-${newStatus.toLowerCase().replace(/\s+/g, '-')}`;
    button.className = `status-button ${statusClass}`;
    button.textContent = newStatus;

    // Show original status if different
    const statusContainer = button.closest('.status-container');
    const copilotStatus = statusContainer.querySelector('.copilot-status');
    
    if (newStatus !== originalStatus) {
        copilotStatus.textContent = `Copilot suggested: ${originalStatus}`;
    } else {
        copilotStatus.textContent = '';
    }

    // Update navigation panel status
    const questionSection = button.closest('.question-section');
    const questionId = questionSection.id;
    const navItem = document.querySelector(`a[href="#${questionId}"]`).parentElement;
    const statusTag = navItem.querySelector('.status-tag');
    
    // Update status tag with the same class
    statusTag.className = `status-tag ${statusClass}`;
    statusTag.textContent = newStatus;

    // Update summary stats
    updateSummaryStats();

    // Update index page stats if we're on a category page
    updateIndexPageStats();

    // Close dropdown
    dropdown.classList.remove('show');
}

function updateSummaryStats() {
    const statusTags = document.querySelectorAll('.status-tag');
    const stats = {
        'Following': 0,
        'Not Following': 0,
        'Partially Following': 0
    };

    statusTags.forEach(tag => {
        const status = tag.textContent;
        stats[status]++;
    });

    // Update summary chips in the header
    const summaryFollowing = document.querySelector('.summary-following');
    const summaryNotFollowing = document.querySelector('.summary-not-following');
    const summaryPartial = document.querySelector('.summary-partial');

    if (summaryFollowing) summaryFollowing.textContent = `Following: ${stats['Following']}`;
    if (summaryNotFollowing) summaryNotFollowing.textContent = `Not Following: ${stats['Not Following']}`;
    if (summaryPartial) summaryPartial.textContent = `Partial: ${stats['Partially Following']}`;
}

function updateIndexPageStats() {
    // Only proceed if we're on a category page
    if (!window.location.pathname.includes('code_review_')) return;

    // Get current page's category name from the URL
    const categoryName = window.location.pathname.split('/').pop().replace('.html', '');
    
    // Store the current stats in localStorage
    const stats = {
        following: document.querySelector('.summary-following').textContent.match(/\d+/)[0],
        notFollowing: document.querySelector('.summary-not-following').textContent.match(/\d+/)[0],
        partial: document.querySelector('.summary-partial').textContent.match(/\d+/)[0]
    };
    
    localStorage.setItem(`${categoryName}_stats`, JSON.stringify(stats));

    // If index page is open in another tab, trigger an update
    localStorage.setItem('stats_update_trigger', Date.now().toString());
}

// Check for updates from category pages
window.addEventListener('storage', function(e) {
    // Only proceed if we're on the index page
    if (!window.location.pathname.endsWith('index.html')) return;
    
    if (e.key === 'stats_update_trigger') {
        // Find category pages that have stored stats
        const categoryPages = Object.keys(localStorage)
            .filter(key => key.startsWith('code_review_') && key.endsWith('_stats'));
            
        categoryPages.forEach(categoryKey => {
            const stats = JSON.parse(localStorage.getItem(categoryKey));
            const categoryId = categoryKey.replace('_stats', '');
            
            // Find the corresponding card and update its stats
            const card = document.querySelector(`.card[onclick*="${categoryId}.html"]`);
            if (card) {
                const following = card.querySelector('.stat-chip.following');
                const notFollowing = card.querySelector('.stat-chip.not-following');
                const partial = card.querySelector('.stat-chip.partial');
                
                if (following) following.textContent = `Following: ${stats.following}`;
                if (notFollowing) notFollowing.textContent = `Not Following: ${stats.notFollowing}`;
                if (partial) partial.textContent = `Partial: ${stats.partial}`;
            }
        });

        // Update total summary stats in header
        updateTotalStats();
    }
});

// Function to update total stats in the index page header
function updateTotalStats() {
    if (!window.location.pathname.endsWith('index.html')) return;
    
    let totals = {
        following: 0,
        notFollowing: 0,
        partial: 0
    };
    
    // Get all stat chips from category cards
    document.querySelectorAll('.card .stats').forEach(statsContainer => {
        const following = statsContainer.querySelector('.following').textContent.match(/\d+/)[0];
        const notFollowing = statsContainer.querySelector('.not-following').textContent.match(/\d+/)[0];
        const partial = statsContainer.querySelector('.partial').textContent.match(/\d+/)[0];
        
        totals.following += parseInt(following);
        totals.notFollowing += parseInt(notFollowing);
        totals.partial += parseInt(partial);
    });
    
    // Update header summary stats
    const summaryFollowing = document.querySelector('.header .summary-following');
    const summaryNotFollowing = document.querySelector('.header .summary-not-following');
    const summaryPartial = document.querySelector('.header .summary-partial');
    
    if (summaryFollowing) summaryFollowing.textContent = `Following: ${totals.following}`;
    if (summaryNotFollowing) summaryNotFollowing.textContent = `Not Following: ${totals.notFollowing}`;
    if (summaryPartial) summaryPartial.textContent = `Partial Following: ${totals.partial}`;
}

// Initialize stats when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.endsWith('index.html')) {
        updateTotalStats();
    }
});