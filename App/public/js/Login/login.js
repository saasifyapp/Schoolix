function showLoadingBar() {
    const loadingBar = document.querySelector('.loading-bar');
    loadingBar.style.display = 'block';
}

function hideLoadingBar() {
    const loadingBar = document.querySelector('.loading-bar');
    loadingBar.style.display = 'none';
}

// Toggle login type
const schoolButton = document.getElementById('schoolButton');
const adminButton = document.getElementById('adminButton');
let loginType = 'school';

schoolButton.addEventListener('click', () => {
    loginType = 'school';
    schoolButton.classList.add('active');
    adminButton.classList.remove('active');
});

adminButton.addEventListener('click', () => {
    loginType = 'admin';
    adminButton.classList.add('active');
    schoolButton.classList.remove('active');
});

// Form Flip Image Animation
const usernameInput = document.querySelector('input[name="username"]');
const passwordInput = document.querySelector('input[name="password"]');
const loginIcon = document.querySelector('.login-form img');

function animateUsernameImage(imgSrc) {
    loginIcon.src = imgSrc;

    const rotationAnimation = loginIcon.animate([
        { transform: 'rotateY(-90deg)', opacity: 0 },
        { transform: 'rotateY(0)', opacity: 1 }
    ], {
        duration: 1000,
        easing: 'ease',
        fill: 'forwards'
    });

    loginIcon.style.opacity = '0';
}

function animatePasswordImage(imgSrc) {
    loginIcon.src = imgSrc;

    const rotationAnimation = loginIcon.animate([
        { transform: 'rotateY(-90deg)', opacity: 0 },
        { transform: 'rotateY(0)', opacity: 1 }
    ], {
        duration: 500,
        easing: 'ease',
        fill: 'forwards'
    });

    loginIcon.style.opacity = '0';
}

usernameInput.addEventListener('focus', function () {
    animateUsernameImage('../images/login.png');
});

usernameInput.addEventListener('blur', function () {
    animateUsernameImage('../images/locked.png');
});

passwordInput.addEventListener('focus', function () {
    animatePasswordImage('../images/key.png');
});

passwordInput.addEventListener('blur', function () {
    animatePasswordImage('../images/locked.png');
});

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const schoolButton = document.getElementById('schoolButton');
    const adminButton = document.getElementById('adminButton');
    let isAdmin = false;

    schoolButton.addEventListener('click', () => {
        isAdmin = false;
        schoolButton.classList.add('active');
        adminButton.classList.remove('active');
    });

    adminButton.addEventListener('click', () => {
        isAdmin = true;
        adminButton.classList.add('active');
        schoolButton.classList.remove('active');
    });

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        showLoadingBar();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const loginEndpoint = isAdmin ? '/admin-login' : '/login';

        fetch(loginEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => {
            if (response.ok) {
                hideLoadingBar();
                window.location.href = isAdmin ? '/adminpanel' : '/dashboard';
            } else if (response.status === 401) {
                hideLoadingBar();
                response.text().then(message => showToast(message, true));
            } else if (response.status === 500) {
                hideLoadingBar();
                showToast('Internal Server Error. Please try again later.', true);
            } else {
                hideLoadingBar();
                showToast('An error occurred. Please try again.', true);
            }
        })
        .catch(error => {
            hideLoadingBar();
            showToast('Network error. Please check your connection and try again.', true);
            console.error('Error logging in:', error);
        });
    });
});


// Function to display toast message
function showToast(message, isError) {
    const toastContainer = document.getElementById("toast-container");

    // Create a new toast element
    const toast = document.createElement("div");
    toast.classList.add("toast");
    if (isError) {
        toast.classList.add("error");
    }
    toast.textContent = message;

    // Append the toast to the container
    toastContainer.appendChild(toast);

    // Show the toast
    toast.style.display = 'block';

    // Remove the toast after 4 seconds
    setTimeout(function () {
        toast.style.animation = 'slideOutRight 0.5s forwards';
        toast.addEventListener('animationend', function () {
            toast.remove();
        });
    }, 4000);
}
