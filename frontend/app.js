// Mock Data for initial Feed
const initialFeedData = [
    {
        id: 1,
        donor: 'Grand Palace Hotel',
        type: 'Cooked Meals',
        quantity: 120,
        expiry: '14:30',
        location: 'Downtown Center, Block A',
        isUrgent: true,
        claimed: false
    },
    {
        id: 2,
        donor: 'Fresh Bakery Co.',
        type: 'Bakery Items',
        quantity: 40,
        expiry: '18:00',
        location: 'Westside Market',
        isUrgent: false,
        claimed: false
    },
    {
        id: 3,
        donor: 'TechCorp Annual Event',
        type: 'Packaged Food',
        quantity: 250,
        expiry: '20:00',
        location: 'Convention Center',
        isUrgent: false,
        claimed: false
    }
];

class App {
    constructor() {
        this.currentRoute = 'home';
        this.feedData = [...initialFeedData];
        this.impactStats = {
            meals: 15420,
            volunteers: 3200,
            co2: 25
        };
        
        this.init();
    }

    init() {
        this.renderFeed();
        this.animateCounters();
        
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

    handleDonationSubmit(e) {
        e.preventDefault();
        
        const donorName = document.getElementById('donor-name').value;
        const foodType = document.getElementById('food-type').value;
        const quantity = parseInt(document.getElementById('quantity').value);
        const expiry = document.getElementById('expiry-time').value;
        const location = document.getElementById('location').value;

        const newDonation = {
            id: Date.now(),
            donor: donorName,
            type: foodType,
            quantity: quantity,
            expiry: expiry,
            location: location,
            isUrgent: this.checkUrgency(expiry),
            claimed: false
        };

        this.feedData.unshift(newDonation); // Add to top
        this.renderFeed();
        
        // Show success modal
        document.getElementById('success-modal').classList.add('active');
        e.target.reset();
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

    claimFood(id) {
        const itemIndex = this.feedData.findIndex(item => item.id === id);
        if (itemIndex > -1 && !this.feedData[itemIndex].claimed) {
            this.feedData[itemIndex].claimed = true;
            this.renderFeed();
            
            // Update impact stats
            this.impactStats.meals += this.feedData[itemIndex].quantity;
            this.impactStats.co2 += (this.feedData[itemIndex].quantity * 0.001); // Mock calculation
            
            this.updateStatsDisplay();
        }
    }

    renderFeed(filter = null) {
        const feedGrid = document.getElementById('food-feed-grid');
        feedGrid.innerHTML = '';

        let filteredData = this.feedData;
        if (filter) {
            filteredData = this.feedData.filter(item => item.type === filter);
        }

        filteredData.forEach(item => {
            const card = document.createElement('div');
            card.className = `food-card glass-card fade-in-up ${item.claimed ? 'claimed' : ''}`;
            
            const tagHTML = item.isUrgent ? `<span class="tag-urgent"><i class="fa-solid fa-clock"></i> Urgent</span>` : `<span class="tag-type">${item.type}</span>`;
            
            card.innerHTML = `
                <div class="card-tags">
                    ${tagHTML}
                    ${item.claimed ? `<span class="badge" style="background: rgba(16, 185, 129, 0.1); color: var(--primary);">Claimed</span>` : ''}
                </div>
                <h3>${item.quantity} Servings of ${item.type}</h3>
                <div class="donor"><i class="fa-solid fa-building"></i> ${item.donor}</div>
                <div class="card-details">
                    <div class="detail-item">
                        <i class="fa-solid fa-hourglass-end"></i> Pick up before ${item.expiry}
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
        // Specifically update the meals counter
        const mealCounter = document.querySelector('.impact-card:nth-child(1) .counter');
        if(mealCounter) {
            mealCounter.setAttribute('data-target', this.impactStats.meals);
            this.animateCounters(); // Re-trigger
        }
    }
}

// Initialize App
const app = new App();
