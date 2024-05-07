 //======================== TO ANIMATE IMAGE MOVEMENT ON MOUSE TRACKING =============//

//  var container = document.getElementById('container1');
//  var image = container.querySelector('img');

//  container.addEventListener('mousemove', function (e) {
//      var boundingRect = container.getBoundingClientRect();
//      var offsetX = e.clientX - boundingRect.left - boundingRect.width / 2;
//      var offsetY = e.clientY - boundingRect.top - boundingRect.height / 2;
//      var percentX = offsetX / (boundingRect.width / 2) * 5; // Adjust the speed as needed
//      var percentY = offsetY / (boundingRect.height / 2) * 5; // Adjust the speed as needed
//      var rotateX = -3 * percentY; // Adjust the degree of rotation as needed
//      var rotateY = 3 * percentX; // Adjust the degree of rotation as needed
//      var transformValue = 'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.05)'; // Magnifying effect
//      image.style.transform = transformValue;
//  });

//  container.addEventListener('mouseleave', function () {
//      image.style.transform = 'none';
//  });



 //===========================TO ANIMATE FORM FLIP IMAGE========================//

 // Select username and password inputs
 const usernameInput = document.querySelector('input[name="username"]');
 const passwordInput = document.querySelector('input[name="password"]');
 const loginIcon = document.querySelector('.login-form img');



 // Function to handle animation for username input
 function animateUsernameImage(imgSrc) {
     // Initially hide the image
     // Update image source after the animation is finished
     loginIcon.src = imgSrc; // Update image source

     // Apply rotation animation
     const rotationAnimation = loginIcon.animate([
         { transform: 'rotateY(-90deg)', opacity: 0 }, // Rotate and hide the image
         { transform: 'rotateY(0)', opacity: 1 } // Rotate back and show the image
     ], {
         duration: 1000, // Animation duration in milliseconds
         easing: 'ease', // Animation easing function
         fill: 'forwards' // Maintain the final state of the animation
     });

     loginIcon.style.opacity = '0';


 }

 // Function to handle animation for password input
 function animatePasswordImage(imgSrc) {

     // Update image source after the animation is finished  
     loginIcon.src = imgSrc; // Update image source

     // Apply rotation animation
     const rotationAnimation = loginIcon.animate([
         { transform: 'rotateY(-90deg)', opacity: 0 }, // Rotate and hide the image
         { transform: 'rotateY(0)', opacity: 1 } // Rotate back and show the image
     ], {
         duration: 500, // Animation duration in milliseconds
         easing: 'ease', // Animation easing function
         fill: 'forwards' // Maintain the final state of the animation
     });

     loginIcon.style.opacity = '0'; // Initially hide the image               

 }

 // Listen for focus events on username input
 usernameInput.addEventListener('focus', function () {
     animateUsernameImage('../images/login.png');
 });

 // Listen for blur events on username input
 usernameInput.addEventListener('blur', function () {
     animateUsernameImage('../images/locked.png');
 });

 // Listen for focus events on password input
 passwordInput.addEventListener('focus', function () {
     animatePasswordImage('../images/key.png');
 });

 // Listen for blur events on password input
 passwordInput.addEventListener('blur', function () {
     animatePasswordImage('../images/locked.png');
 });

// Handle form submission
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting

    // Get username and password from the form
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Make a POST request to the server to log in
    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (response.ok) {
            // If login succeeds, redirect to dashboard
            window.location.href = '/dashboard';
        } else if (response.status === 401) {
            // If login fails, display error message
            response.text().then(message => showToast(message, true));
            // window.location.href = '/dashboard';
        } 
        else if (response.status === 402) {
            // If login fails, display error message
            // response.text().then(message => showToast(message, true));
            window.location.href = '/dashboard';
        }
        else if (response.status === 500) {
            // If internal server error, display error message
            showToast('Internal Server Error. Please try again later.', true);
        } else {
            // If other errors (e.g., bad request), display error message
            showToast('An error occurred. Please try again.', true);
        }
    })
    .catch(error => {
        // If network error, display error message
        showToast('Network error. Please check your connection and try again.', true);
        console.error('Error logging in:', error);
    });
});

// Function to display toast message
function showToast(message, isError) {
    const toast = document.getElementById('toast');
    toast.textContent = message;

    // Set class based on isError flag
    if (isError) {
        toast.classList.add('error');
    } else {
        toast.classList.remove('error');
    }

    // Show the toast
    toast.style.display = 'block';

    // Hide the toast after 3 seconds
    setTimeout(function () {
        toast.style.display = 'none';
    }, 3000);
}
