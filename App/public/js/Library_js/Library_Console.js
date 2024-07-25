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

    bookVaultButton.addEventListener('click', function () {
        showOverlay('bookVaultOverlay');
        refreshBooksData();
    });

    addBookButton.addEventListener('click', function () {
        hideOverlay('bookVaultOverlay');
        showOverlay('addBookOverlay');
    });

    searchBookButton.addEventListener('click', function () {
        hideOverlay('bookVaultOverlay');
        showOverlay('searchBookOverlay');
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
        refreshMembersData();
    });

    addMemberButton.addEventListener('click', function () {
        hideOverlay('manageMemberOverlay');
        showOverlay('addMemberOverlay');
    });

    searchMemberButton.addEventListener('click', function () {
        hideOverlay('manageMemberOverlay');
        showOverlay('searchMemberOverlay');
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
    });

    closeReturnBookOverlay.addEventListener('click', function () {
        hideOverlay('returnBookOverlay');
    });
});

function showOverlay(overlayId) {
    document.getElementById(overlayId).style.display = "flex";
}

function hideOverlay(overlayId) {
    document.getElementById(overlayId).style.display = "none";
}
