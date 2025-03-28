// import require

// console.log(process.env.API_KEY); 
// console.log(process.env.PORT);

let allHotels = []; 

// Show loading state
function showLoading() {
    const container = document.getElementById('data-container');
    container.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Searching for hotels...</p>
        </div>
    `;
}

// Show error message with dismiss button
function showError(message) {
    const container = document.getElementById('data-container');
    container.innerHTML = `
        <div class="error-message">
            <p>${message}</p>
            <button onclick="this.parentElement.remove()">Dismiss</button>
        </div>
    `;
}

// Validate date inputs
function validateDates(arrival, departure) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const arrivalDate = new Date(arrival);
    const departureDate = new Date(departure);

    if (arrivalDate < today) {
        showError('Arrival date cannot be in the past.');
        return false;
    }

    if (departureDate <= arrivalDate) {
        showError('Departure date must be after arrival date.');
        return false;
    }

    return true;
}

document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault();
    fetchHotels();
});

async function fetchHotels() {
    const arrival = document.getElementById('arrival').value;
    const departure = document.getElementById('departure').value;
    const roomQty = document.getElementById('roomQty').value;
    const travelPurpose = document.getElementById('travelPurpose').value;
    const orderBy = document.getElementById('orderBy').value;

    // Clear previous results
    document.getElementById('data-container').innerHTML = '';

    // Input validation
    if (!arrival || !departure) {
        showError('Please select both arrival and departure dates.');
        return;
    }

    if (roomQty < 1) {
        showError('Room quantity must be at least 1.');
        return;
    }

    // Date validation
    if (!validateDates(arrival, departure)) {
        return;
    }

    const apiUrl = `https://apidojo-booking-v1.p.rapidapi.com/properties/list-by-map?room_qty=${roomQty}&guest_qty=1&bbox=14.291283%2C14.948423%2C120.755688%2C121.136864&search_id=none&price_filter_currencycode=USD&categories_filter=class%3A%3A1%2Cclass%3A%3A2%2Cclass%3A%3A3&languagecode=en-us&travel_purpose=${travelPurpose}&order_by=${orderBy}&offset=0&arrival_date=${arrival}&departure_date=${departure}`;

    try {
        showLoading(); // Show loading state

        // API key part kept exactly as in original code
        const apiKey = (typeof CONFIG !== 'undefined' && CONFIG.RAPID_API_KEY) 
            ? CONFIG.RAPID_API_KEY 
            : 'c039f88865msh38e2b12047d3ed2p145ecajsn961cecd165c9';

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey,
                'x-rapidapi-host': 'apidojo-booking-v1.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);
        
        if (data.result) {
            allHotels = data.result;
            displayData(allHotels);
            populateFilters();
            document.getElementById('filterSection').style.display = 'block';
            document.getElementById('toggleFilters').textContent = 'Hide Filters';
        } else {
            document.getElementById('data-container').innerHTML = `
                <div class="no-results">
                    <p>No hotels found matching your criteria.</p>
                    <p>Try adjusting your search parameters.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        showError(`We encountered an issue: ${error.message}. Please try again later.`);
    }
}

// Rest of your original functions remain exactly the same
function displayData(data) {
    const dataContainer = document.getElementById('data-container');
    dataContainer.innerHTML = '';

    if (data.length === 0) {
        dataContainer.innerHTML = `
            <div class="no-results">
                <p>No hotels match your current filters.</p>
                <p>Try different filter settings.</p>
            </div>
        `;
        return;
    }

    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'hotel-card';

        div.innerHTML = `
            <h3>${item.hotel_name}</h3>
            <p><strong>Address:</strong> ${item.address}</p>
            <p><strong>Price:</strong> ${item.price_breakdown.all_inclusive_price} ${item.price_breakdown.currency}</p>
            <p><strong>Type:</strong> ${item.accommodation_type_name}</p>
            <p><strong>Swimming Pool:</strong> ${item.has_swimming_pool ? 'Yes' : 'No'}</p>
            <p><strong>Review Score:</strong> ${item.review_score}</p>
            <p><strong>Review Count:</strong> ${item.review_count}</p>
            <img src="${item.main_photo_url}" alt="${item.hotel_name}" />
            <a href="${item.url}" target="_blank">View Hotel</a>
        `;

        dataContainer.appendChild(div);
    });
}

function populateFilters() {
    const addressFilter = document.getElementById('addressFilter');
    const reviewFilter = document.getElementById('reviewFilter');

    addressFilter.innerHTML = '<option value="">All</option>';
    reviewFilter.innerHTML = '<option value="">All</option>';

    const uniqueAddresses = [...new Set(allHotels.map(h => h.address))];
    uniqueAddresses.forEach(address => {
        addressFilter.innerHTML += `<option value="${address}">${address}</option>`;
    });

    const uniqueReviewScores = [...new Set(allHotels.map(h => h.review_score))].sort();
    uniqueReviewScores.forEach(score => {
        reviewFilter.innerHTML += `<option value="${score}">${score}</option>`;
    });
}

function applyFilters() {
    const addressValue = document.getElementById('addressFilter').value;
    const poolValue = document.getElementById('poolFilter').value;
    const reviewValue = document.getElementById('reviewFilter').value;

    const filteredHotels = allHotels.filter(hotel => 
        (addressValue === '' || hotel.address === addressValue) &&
        (poolValue === '' || hotel.has_swimming_pool == poolValue) &&
        (reviewValue === '' || hotel.review_score == reviewValue)
    );

    displayData(filteredHotels);
}

// Toggle Filter Section
document.getElementById('toggleFilters').addEventListener('click', function() {
    const filterSection = document.getElementById('filterSection');
    filterSection.style.display = filterSection.style.display === 'block' ? 'none' : 'block';
    this.textContent = filterSection.style.display === 'block' ? 'Hide Filters' : 'Show Filters';
});

// Add event listener for the filter button if it exists
const filterButton = document.getElementById('applyFilters');
if (filterButton) {
    filterButton.addEventListener('click', applyFilters);
}