document.addEventListener('DOMContentLoaded', function () {
    // Book Vault Overlays
    const bookVaultButton = document.getElementById('bookVaultButton');
    const addBookButton = document.getElementById('addBookButton');
    const searchBookButton = document.getElementById('searchBookButton');
    const closeBookVaultOverlay = document.getElementById('closeBookVaultOverlay');
    const closeAddBookOverlay = document.getElementById('closeAddBookOverlay');
    const closeSearchBookOverlay = document.getElementById('closeSearchBookOverlay');

    // Manage Member Overlays
    const manageMemberButton = document.getElementById('manageMemberButton');
    const addMemberButton = document.getElementById('addMemberButton');
    const searchMemberButton = document.getElementById('searchMemberButton');
    const closeManageMemberOverlay = document.getElementById('closeManageMemberOverlay');
    const closeAddMemberOverlay = document.getElementById('closeAddMemberOverlay');
    const closeSearchMemberOverlay = document.getElementById('closeSearchMemberOverlay');

    // Transaction Tracker Overlays
    const transactionTrackerButton = document.getElementById('transactionTrackerButton');
    const issueBookButton = document.getElementById('issueBookButton');
    const returnBookButton = document.getElementById('returnBookButton');
    const closeTransactionTrackerOverlay = document.getElementById('closeTransactionTrackerOverlay');
    const closeIssueBookOverlay = document.getElementById('closeIssueBookOverlay');
    const closeReturnBookOverlay = document.getElementById('closeReturnBookOverlay');

    // Report Overlay
    const reportButton = document.getElementById('reportButton');
    const closeReportOverlay = document.getElementById('closeReportOverlay');
    const reportSearchButton = document.getElementById('reportSearchButton');
    const refreshReportButton = document.getElementById('refreshReportButton');
    const exportReportButton = document.getElementById('exportReport');

    bookVaultButton.addEventListener('click', function () {
        showOverlay('bookVaultOverlay');
    });

    addBookButton.addEventListener('click', function () {
        hideOverlay('bookVaultOverlay');
        showOverlay('addBookOverlay');
        // updateBookIDField();
    });

    searchBookButton.addEventListener('click', function () {
        hideOverlay('bookVaultOverlay');
        showOverlay('searchBookOverlay');
        refreshBooksData();
    });

    closeBookVaultOverlay.addEventListener('click', function () {
        hideOverlay('bookVaultOverlay');
    });

    closeAddBookOverlay.addEventListener('click', function () {
        hideOverlay('addBookOverlay');
    });

    closeSearchBookOverlay.addEventListener('click', function () {
        hideOverlay('searchBookOverlay');
    });

    manageMemberButton.addEventListener('click', function () {
        showOverlay('manageMemberOverlay');
    });

    addMemberButton.addEventListener('click', function () {
        hideOverlay('manageMemberOverlay');
        showOverlay('addMemberOverlay');
        // updateMemberID();
    });

    searchMemberButton.addEventListener('click', function () {
        hideOverlay('manageMemberOverlay');
        showOverlay('searchMemberOverlay');
        refreshMembersData();
    });

    closeManageMemberOverlay.addEventListener('click', function () {
        hideOverlay('manageMemberOverlay');
    });

    closeAddMemberOverlay.addEventListener('click', function () {
        hideOverlay('addMemberOverlay');
    });

    closeSearchMemberOverlay.addEventListener('click', function () {
        hideOverlay('searchMemberOverlay');
    });

    transactionTrackerButton.addEventListener('click', function () {
        showOverlay('transactionTrackerOverlay');
    });

    issueBookButton.addEventListener('click', function () {
        hideOverlay('transactionTrackerOverlay');
        showOverlay('issueBookOverlay');
    });

    returnBookButton.addEventListener('click', function () {
        hideOverlay('transactionTrackerOverlay');
        showOverlay('returnBookOverlay');
    });

    closeTransactionTrackerOverlay.addEventListener('click', function () {
        hideOverlay('transactionTrackerOverlay');
    });

    closeIssueBookOverlay.addEventListener('click', function () {
        hideOverlay('issueBookOverlay');

        //explicit
        // Manually clear readonly fields
        document.getElementById('studentName').value = '';
        document.getElementById('class').value = '';
        document.getElementById('studentcontact').value = '';
        document.getElementById('issuebookName').value = '';
        document.getElementById('bookauthorName').value = '';
        document.getElementById('bookPublicationName').value = '';
    });

    closeReturnBookOverlay.addEventListener('click', function () {
        hideOverlay('returnBookOverlay');
    });

    // Report Overlay
    reportButton.addEventListener('click', function () {
        showOverlay('reportOverlay');
    });

    closeReportOverlay.addEventListener('click', function () {
        hideOverlay('reportOverlay');
    });


});

function showOverlay(overlayId) {
    document.getElementById(overlayId).style.display = "flex";
}

function hideOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);
    overlay.style.display = "none";

    // Reset form fields if the overlay contains a form
    const form = overlay.querySelector('form');
    if (form) {
        form.reset();
    }
}

// Function to show the loading animation
function showLibraryLoadingAnimation() {
    var loadingOverlay = document.getElementById("loadingOverlaylibrary");
    loadingOverlay.style.display = "flex";
}

// Function to hide the loading animation
function hidelibraryLoadingAnimation() {
    var loadingOverlay = document.getElementById("loadingOverlaylibrary");
    loadingOverlay.style.display = "none"; // Hide the loading overlay
}

function togglePopup() {
    fetch('/settings')
        .then(response => response.json())
        .then(data => {
            // Display fetched data in the popup
            document.getElementById('bookReturnInterval').value = data.library_interval;
            document.getElementById('penaltyInterval').value = data.library_penalty;

            // Check the values and display the alert if conditions are met
            checkAndDisplayAlert(data.library_interval, data.library_penalty);
        })
        .catch(error => {
            console.error('Error fetching settings:', error);
        });
}
togglePopup();

document.getElementById('saveSettingsButton').addEventListener('click', async function() {
    const bookReturnInterval = parseInt(document.getElementById('bookReturnInterval').value, 10);
    const penaltyInterval = parseInt(document.getElementById('penaltyInterval').value, 10);

    // Get the username from cookies
    const username = getCookie('username'); // Assume you have a function to get cookies

    if (username) {
        try {
            const response = await fetch('/update-settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    bookReturnInterval: bookReturnInterval,
                    penaltyInterval: penaltyInterval
                })
            });

            if (response.ok) {
                showToast('Settings updated successfully.', false);
                // document.getElementById('settingsPopup').style.display = 'none';
                setTimeout(() => {
                    location.reload();
                }, 1200); // Delay of 1.2 seconds before reloading
            } else {
                throw new Error('Failed to update settings');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('An error occurred while updating settings.', true);
        }
    } else {
        showToast('No username found in cookies.', true);
    }
});

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Initial Setup Alert
function initial_setup_alert(bookReturnIntervalValue, penaltyIntervalValue) {
    // Ensure the values are not empty and default to 0 if they are
    bookReturnIntervalValue = bookReturnIntervalValue !== undefined ? bookReturnIntervalValue : 0;
    penaltyIntervalValue = penaltyIntervalValue !== undefined ? penaltyIntervalValue : 0;

    Swal.fire({
        title: 'Welcome to Schoolix Library',
        html: `
            <p style="color: red;">The below values should not be zero</p>
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
                <label for="swal-bookReturnInterval" style="flex: 1; margin-right: 0;">Issue-Return Interval (in Days):</label>
                <input type="number" id="swal-bookReturnInterval" class="swal2-input" value="${bookReturnIntervalValue}" style="width: 60px; height: 35px; text-align: center;">
            </div>
            <div style="display: flex; align-items: center;">
                <label for="swal-penaltyInterval" style="flex: 1; margin-right: 0;">Penalty per Day (in Rs):</label>
                <input type="number" id="swal-penaltyInterval" class="swal2-input" value="${penaltyIntervalValue}" style="width: 60px; height: 35px; text-align: center;">
            </div>
        `,
        icon: 'info',
        confirmButtonText: 'OK',
        customClass: {
            popup: 'library_setup_popup',
            confirmButton: 'library_setup_button',
            title: 'library_setup_title'
        },
        preConfirm: () => {
            const bookReturnInterval = Swal.getPopup().querySelector('#swal-bookReturnInterval').value;
            const penaltyInterval = Swal.getPopup().querySelector('#swal-penaltyInterval').value;
            return { bookReturnInterval: bookReturnInterval, penaltyInterval: penaltyInterval };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            // Get the username from cookies
            const username = getCookie('username'); // Assume you have a function to get cookies

            if (username) {
                try {
                    const response = await fetch('/update-settings', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            username: username,
                            bookReturnInterval: parseInt(result.value.bookReturnInterval, 10),
                            penaltyInterval: parseInt(result.value.penaltyInterval, 10)
                        })
                    });

                    if (response.ok) {
                        showToast('Settings updated successfully.', false);
                        setTimeout(() => {
                            location.reload();
                        }, 1200); // Delay of 1.2 seconds before reloading
                    } else {
                        throw new Error('Failed to update settings');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    showToast('An error occurred while updating settings.', true);
                }
            } else {
                showToast('No username found in cookies.', true);
            }
        }
    });
}


// Function to check the values and display the alert
function checkAndDisplayAlert(bookReturnInterval, penaltyInterval) {
    if (bookReturnInterval === 0 && penaltyInterval === 0) {
        initial_setup_alert(bookReturnInterval, penaltyInterval);
    }
}