// Secure API key handling
const API_KEY = process.env.RAPIDAPI_KEY || '';

// Show error if API key is missing
if (!API_KEY) {
    console.error('API key missing! Create .env file with RAPIDAPI_KEY');
    const errorElement = document.createElement('div');
    errorElement.className = 'api-error';
    errorElement.innerHTML = `
        <p>System configuration error - please contact support</p>
        <p><small>Error: Missing API credentials</small></p>
    `;
    document.getElementById('searchForm').replaceWith(errorElement);
}

let allHotels = [];

document.getElementById('searchForm').addEventListener('submit', function(event) {
    event.preventDefault();
    fetchHotels();
});

async function fetchHotels() {
    // Block requests if no API key
    if (!API_KEY) return;

    const arrival = document.getElementById('arrival').value;
    const departure = document.getElementById('departure').value;
    const roomQty = document.getElementById('roomQty').value;
    const travelPurpose = document.getElementById('travelPurpose').value;
    const orderBy = document.getElementById('orderBy').value;

    if (!arrival || !departure || roomQty < 1) {
        alert('Please fill in all required fields.');
        return;
    }

    const apiUrl = `https://apidojo-booking-v1.p.rapidapi.com/properties/list-by-map?room_qty=${roomQty}&guest_qty=1&bbox=14.291283%2C14.948423%2C120.755688%2C121.136864&search_id=none&price_filter_currencycode=USD&categories_filter=class%3A%3A1%2Cclass%3A%3A2%2Cclass%3A%3A3&languagecode=en-us&travel_purpose=${travelPurpose}&order_by=${orderBy}&offset=0&arrival_date=${arrival}&departure_date=${departure}`;

    try {
        // Show loading state
        document.getElementById('data-container').innerHTML = '<div class="loading">Searching hotels...</div>';
        
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': API_KEY,
                'x-rapidapi-host': 'apidojo-booking-v1.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();
        
        if (data.result) {
            allHotels = data.result;
            displayData(allHotels);
            populateFilters();
            document.getElementById('filterSection').style.display = 'block';
            document.getElementById('toggleFilters').textContent = 'Hide Filters';
        } else {
            document.getElementById('data-container').innerHTML = '<p class="no-results">No hotels found matching your criteria</p>';
        }
    } catch (error) {
        console.error('API Error:', error);
        document.getElementById('data-container').innerHTML = `
            <div class="error">
                <p>Failed to load hotel data</p>
                <button onclick="fetchHotels()">Retry</button>
            </div>
        `;
    }
}

function displayData(data) {
    const dataContainer = document.getElementById('data-container');
    dataContainer.innerHTML = '';

    if (data.length === 0) {
        dataContainer.innerHTML = '<p class="no-results">No matching hotels found</p>';
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

document.getElementById('toggleFilters').addEventListener('click', function() {
    const filterSection = document.getElementById('filterSection');
    filterSection.style.display = filterSection.style.display === 'block' ? 'none' : 'block';
    this.textContent = filterSection.style.display === 'block' ? 'Hide Filters' : 'Show Filters';
});
