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