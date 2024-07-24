document.addEventListener('DOMContentLoaded', function() {
    const bookVaultButton = document.getElementById('bookVaultButton');
    const addBookButton = document.getElementById('addBookButton');
    const searchBookButton = document.getElementById('searchBookButton');
    const closeBookVaultOverlay = document.getElementById('closeBookVaultOverlay');
    const closeAddBookOverlay = document.getElementById('closeAddBookOverlay');
    const closeSearchBookOverlay = document.getElementById('closeSearchBookOverlay');

    const manageMemberButton = document.getElementById('manageMemberButton');
    const addMemberButton = document.getElementById('addMemberButton');
    const searchMemberButton = document.getElementById('searchMemberButton');
    const closeManageMemberOverlay = document.getElementById('closeManageMemberOverlay');
    const closeAddMemberOverlay = document.getElementById('closeAddMemberOverlay');
    const closeSearchMemberOverlay = document.getElementById('closeSearchMemberOverlay');


    bookVaultButton.addEventListener('click', function() {
        showOverlay('bookVaultOverlay');
    });

    addBookButton.addEventListener('click', function() {
        hideOverlay('bookVaultOverlay');
        showOverlay('addBookOverlay');
    });

    searchBookButton.addEventListener('click', function() {
        hideOverlay('bookVaultOverlay');
        showOverlay('searchBookOverlay');
    });

    closeBookVaultOverlay.addEventListener('click', function() {
        hideOverlay('bookVaultOverlay');
    });

    closeAddBookOverlay.addEventListener('click', function() {
        hideOverlay('addBookOverlay');
    });

    closeSearchBookOverlay.addEventListener('click', function() {
        hideOverlay('searchBookOverlay');
    });

    manageMemberButton.addEventListener('click', function() {
        showOverlay('manageMemberOverlay');
    });

    addMemberButton.addEventListener('click', function() {
        hideOverlay('manageMemberOverlay');
        showOverlay('addMemberOverlay');
    });

    searchMemberButton.addEventListener('click', function() {
        hideOverlay('manageMemberOverlay');
        showOverlay('searchMemberOverlay');
    });

    closeManageMemberOverlay.addEventListener('click', function() {
        hideOverlay('manageMemberOverlay');
    });

    closeAddMemberOverlay.addEventListener('click', function() {
        hideOverlay('addMemberOverlay');
    });

    closeSearchMemberOverlay.addEventListener('click', function() {
        hideOverlay('searchMemberOverlay');
    });
});

function showOverlay(overlayId) {
    document.getElementById(overlayId).style.display = "block";
}

function hideOverlay(overlayId) {
    document.getElementById(overlayId).style.display = "none";
}