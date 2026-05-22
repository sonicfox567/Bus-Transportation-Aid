let map;
let userMarker;
let userLocation = null;
let sidebarOpen = false;

const LEBANON_CENTER = [33.8938, 35.5018];
const LEBANON_ZOOM = 9;
const USER_ZOOM = 14;

const USER_SETTINGS = {
    accountType: 'Rider',
    userName: ''
};

document.addEventListener('DOMContentLoaded', function() {
    initializeMap();
    requestUserLocation();
    setupEventListeners();
    initializeUserAccount();
});

function initializeUserAccount() {
    const accountTypeElement = document.getElementById('accountType');
    const userNameElement = document.getElementById('userName');
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        if (accountTypeElement) {
            accountTypeElement.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        }
        if (userNameElement) {
            userNameElement.textContent = user.username;
            userNameElement.style.display = 'block';
        }
    } else {
        // Redirect to login if no user is found
        window.location.href = 'index.html';
    }
}

function updateUserAccount(accountType, userName) {
    USER_SETTINGS.accountType = accountType || 'Rider';
    USER_SETTINGS.userName = userName || '';
    
    const accountTypeElement = document.getElementById('accountType');
    const userNameElement = document.getElementById('userName');
    
    if (accountTypeElement) {
        accountTypeElement.textContent = USER_SETTINGS.accountType;
    }
    
    if (userNameElement) {
        if (USER_SETTINGS.userName) {
            userNameElement.textContent = USER_SETTINGS.userName;
            userNameElement.style.display = 'block';
        } else {
            userNameElement.style.display = 'none';
        }
    }
}

function initializeMap() {
    map = L.map('map').setView(LEBANON_CENTER, LEBANON_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    const southWest = L.latLng(33.0, 35.0);
    const northEast = L.latLng(34.7, 36.6);
    const bounds = L.latLngBounds(southWest, northEast);
    map.setMaxBounds(bounds);
}

function requestUserLocation() {
    if (!navigator.geolocation) {
        showLocationBanner('Geolocation is not supported by your browser.');
        return;
    }

    const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
        onLocationSuccess,
        onLocationError,
        options
    );
}

function onLocationSuccess(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    
    userLocation = {
        lat: latitude,
        lng: longitude
    };

    map.setView([latitude, longitude], USER_ZOOM);

    if (userMarker) {
        map.removeLayer(userMarker);
    }

    const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: `
            <div style="
                width: 30px;
                height: 30px;
                background-color: #000000;
                border-radius: 50% 50% 50% 0;
                transform: rotate(-45deg);
                border: 3px solid #ffffff;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                position: relative;
            ">
                <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(45deg);
                    width: 8px;
                    height: 8px;
                    background-color: #ffffff;
                    border-radius: 50%;
                "></div>
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });

    userMarker = L.marker([latitude, longitude], { icon: userIcon })
        .addTo(map)
        .bindPopup('Your Location')
        .openPopup();

    hideLocationBanner();
}

function onLocationError(error) {
    let errorMessage = 'Unable to retrieve your location. ';
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            errorMessage += 'Location access was denied.';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable.';
            break;
        case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
        default:
            errorMessage += 'An unknown error occurred.';
            break;
    }

    showLocationBanner('⚠️ ' + errorMessage + ' Map is centered on Lebanon.');
}
function showLocationBanner(message) {
    const banner = document.getElementById('locationBanner');
    if (banner) {
        banner.innerHTML = `<span>${message}</span>`;
        banner.style.display = 'block';
    }
}

function hideLocationBanner() {
    const banner = document.getElementById('locationBanner');
    if (banner) {
        banner.style.display = 'none';
    }
}

function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
    const sidebar = document.getElementById('sidebarMenu');
    const overlay = document.getElementById('menuOverlay');
    const menuBtn = document.getElementById('menuBtn');

    if (sidebar && overlay && menuBtn) {
        if (sidebarOpen) {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            menuBtn.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            menuBtn.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
}

function closeSidebar() {
    if (sidebarOpen) {
        toggleSidebar();
    }
}

function setupEventListeners() {
    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn) {
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleSidebar();
        });
    }

    const overlay = document.getElementById('menuOverlay');
    if (overlay) {
        overlay.addEventListener('click', closeSidebar);
    }

    const mapContainer = document.getElementById('map');
    if (mapContainer) {
        mapContainer.addEventListener('click', function() {
            if (sidebarOpen) {
                closeSidebar();
            }
        });
    }

    const menuItems = document.querySelectorAll('.menu-item[data-page]');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page) {
                window.location.href = page;
            }
        });
    });

    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            if (userLocation) {
                map.setView([userLocation.lat, userLocation.lng], USER_ZOOM);
            } else {
                map.setView(LEBANON_CENTER, LEBANON_ZOOM);
                requestUserLocation();
            }
        });
    }

    const reservationBtn = document.getElementById('reservationBtn');
    if (reservationBtn) {
        reservationBtn.addEventListener('click', function() {
            alert('Reservation functionality will be implemented later');
        });
    }
}

window.mapController = {
    getMap: () => map,
    getUserLocation: () => userLocation,
    getUserMarker: () => userMarker,
    requestLocation: requestUserLocation
};
