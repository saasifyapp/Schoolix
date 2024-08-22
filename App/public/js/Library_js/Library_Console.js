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
    const popup = document.getElementById('settingsPopup');
    
    // Toggle popup visibility
    popup.style.display = (popup.style.display === 'block') ? 'none' : 'block';

    // Fetch settings data if popup is being shown
    if (popup.style.display === 'block') {
        fetch('/settings')
            .then(response => response.json())
            .then(data => {
                // Display fetched data in the popup
                document.getElementById('bookReturnInterval').value = data.library_interval || 5;
                document.getElementById('penaltyInterval').value = data.library_penalty || 5;
            })
            .catch(error => {
                console.error('Error fetching settings:', error);
            });
    }
}

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
                document.getElementById('settingsPopup').style.display = 'none';
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
