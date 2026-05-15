const API_BASE_URL = 'http://localhost:8080/api';

class App {
    constructor() {
        this.currentRoute = 'home';
        this.feedData = [];
        this.impactStats = {
            mealsRescued: 0,
            activeVolunteers: 0,
            co2Reduced: 0
        };
        
        this.init();
    }

    async init() {
        await this.fetchStats();
        await this.fetchDonations();
        
        // Setup feed filters
        document.querySelectorAll('.feed-filters .badge').forEach(badge => {
            badge.addEventListener('click', (e) => {
                document.querySelectorAll('.feed-filters .badge').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                const filter = e.target.textContent;
                this.renderFeed(filter === 'All' ? null : filter);
            });
        });
    }

    async fetchStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/stats`);
            if (response.ok) {
                const data = await response.json();
                this.impactStats = data;
                this.updateStatsDisplay();
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }

    async fetchDonations() {
        try {
            const response = await fetch(`${API_BASE_URL}/donations`);
            if (response.ok) {
                this.feedData = await response.json();
                this.renderFeed();
            }
        } catch (error) {
            console.error('Error fetching donations:', error);
        }
    }

    navigate(route) {
        // Update nav styling
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.dataset.target === route) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Hide current section
        document.querySelectorAll('.page-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show new section
        const targetSection = document.getElementById(route);
        if (targetSection) {
            targetSection.classList.add('active');
            // Retrigger animations
            const animatedElements = targetSection.querySelectorAll('.fade-in-up');
            animatedElements.forEach(el => {
                el.style.animation = 'none';
                el.offsetHeight; /* trigger reflow */
                el.style.animation = null; 
            });

            if(route === 'home') this.animateCounters();
            if(route === 'feed') this.fetchDonations(); // Refresh on visit
        }

        this.currentRoute = route;
        
        // Close mobile menu if open
        const navLinks = document.querySelector('.nav-links');
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    toggleMenu() {
        document.querySelector('.nav-links').classList.toggle('active');
    }

    async handleDonationSubmit(e) {
        e.preventDefault();
        
        const donorName = document.getElementById('donor-name').value;
        const foodType = document.getElementById('food-type').value;
        const quantity = parseInt(document.getElementById('quantity').value);
        const expiry = document.getElementById('expiry-time').value;
        const location = document.getElementById('location').value;

        const newDonation = {
            donorName: donorName,
            foodType: foodType,
            quantity: quantity,
            expiryTime: expiry,
            location: location,
            urgent: this.checkUrgency(expiry)
        };

        try {
            const response = await fetch(`${API_BASE_URL}/donations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDonation)
            });

            if (response.ok) {
                await this.fetchDonations(); // Refresh list
                
                // Show success modal
                document.getElementById('success-modal').classList.add('active');
                e.target.reset();
            }
        } catch (error) {
            console.error('Error posting donation:', error);
            alert('Failed to post donation. Check backend connection.');
        }
    }

    checkUrgency(timeStr) {
        // Simple logic: if time is within next 2 hours, it's urgent
        const now = new Date();
        const [hours, minutes] = timeStr.split(':').map(Number);
        const expiryTime = new Date();
        expiryTime.setHours(hours, minutes, 0);
        
        const diffHours = (expiryTime - now) / (1000 * 60 * 60);
        return diffHours > 0 && diffHours <= 2;
    }

    async claimFood(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/donations/${id}/claim`, {
                method: 'PUT'
            });

            if (response.ok) {
                // Refresh data
                await this.fetchDonations();
                await this.fetchStats();
            }
        } catch (error) {
            console.error('Error claiming food:', error);
        }
    }

    renderFeed(filter = null) {
        const feedGrid = document.getElementById('food-feed-grid');
        feedGrid.innerHTML = '';

        let filteredData = this.feedData;
        if (filter) {
            filteredData = this.feedData.filter(item => item.foodType === filter);
        }

        filteredData.forEach(item => {
            const card = document.createElement('div');
            card.className = `food-card glass-card fade-in-up ${item.claimed ? 'claimed' : ''}`;
            
            const tagHTML = item.urgent ? `<span class="tag-urgent"><i class="fa-solid fa-clock"></i> Urgent</span>` : `<span class="tag-type">${item.foodType}</span>`;
            
            card.innerHTML = `
                <div class="card-tags">
                    ${tagHTML}
                    ${item.claimed ? `<span class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--primary);">Claimed</span>` : ''}
                </div>
                <h3>${item.quantity} Servings of ${item.foodType}</h3>
                <div class="donor"><i class="fa-solid fa-building"></i> ${item.donorName}</div>
                <div class="card-details">
                    <div class="detail-item">
                        <i class="fa-solid fa-hourglass-end"></i> Pick up before ${item.expiryTime}
                    </div>
                    <div class="detail-item">
                        <i class="fa-solid fa-location-dot"></i> ${item.location}
                    </div>
                </div>
                <button class="btn btn-primary" onclick="app.claimFood(${item.id})" ${item.claimed ? 'disabled' : ''}>
                    ${item.claimed ? '<i class="fa-solid fa-check"></i> Pick-up Confirmed' : 'Claim & Pick Up'}
                </button>
            `;
            feedGrid.appendChild(card);
        });
    }

    closeModal() {
        document.getElementById('success-modal').classList.remove('active');
        this.navigate('feed'); // Redirect to feed after donation
    }

    animateCounters() {
        const counters = document.querySelectorAll('.counter');
        const speed = 200;

        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText.replace(/,/g, '');
                const inc = target / speed;

                if (count < target) {
                    counter.innerText = Math.ceil(count + inc).toLocaleString();
                    setTimeout(updateCount, 10);
                } else {
                    counter.innerText = target.toLocaleString();
                }
            };
            updateCount();
        });
    }
    
    updateStatsDisplay() {
        // Map backend properties to UI elements
        const mealCounter = document.querySelector('.impact-card:nth-child(1) .counter');
        const volCounter = document.querySelector('.impact-card:nth-child(2) .counter');
        const co2Counter = document.querySelector('.impact-card:nth-child(3) .counter');

        if(mealCounter) mealCounter.setAttribute('data-target', this.impactStats.mealsRescued || 0);
        if(volCounter) volCounter.setAttribute('data-target', this.impactStats.activeVolunteers || 0);
        if(co2Counter) co2Counter.setAttribute('data-target', Math.floor(this.impactStats.co2Reduced || 0));
        
        this.animateCounters(); // Re-trigger animations
    }
}

// Initialize App
const app = new App();
