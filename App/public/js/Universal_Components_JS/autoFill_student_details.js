// Utility function to display loading suggestions
function showLoading(suggestionsContainer) {
    suggestionsContainer.innerHTML = '';
    const loadingItem = document.createElement('div');
    loadingItem.classList.add('suggestion-item', 'no-results');
    loadingItem.textContent = 'Loading...';
    suggestionsContainer.appendChild(loadingItem);
    suggestionsContainer.style.display = "flex";
}

// Utility function to display no results found message
function showNoResults(suggestionsContainer) {
    suggestionsContainer.innerHTML = '';
    const noResultsItem = document.createElement('div');
    noResultsItem.classList.add('suggestion-item', 'no-results');
    noResultsItem.textContent = 'No results found';
    suggestionsContainer.appendChild(noResultsItem);
}

// Function to fetch and display suggestions
function fetchAndDisplaySuggestions(query, suggestionsContainer, inputField, additionalActions) {
    if (query.length > 1) {
        showLoading(suggestionsContainer);
        fetch(`/get_student_details?q=${query}`)
            .then(response => response.json())
            .then(data => {
                suggestionsContainer.innerHTML = '';
                if (data.length === 0) {
                    showNoResults(suggestionsContainer);
                } else {
                    data.forEach(student => {
                        const suggestionItem = document.createElement('div');
                        suggestionItem.classList.add('suggestion-item');
                        suggestionItem.textContent = `${student.Grno} | ${student.Name} | ${student.Standard}`;
                        suggestionItem.dataset.Grno = student.Grno;
                        suggestionItem.dataset.name = student.Name;
                        suggestionItem.dataset.standard = student.Standard; // Assuming standard field exists
                        suggestionItem.dataset.contact = student.f_mobile_no; // Assuming contact field exists
                        suggestionsContainer.appendChild(suggestionItem);
                    });
                }
                // Add event listeners for selection
                suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', function () {
                        const selectedItem = event.target;
                        inputField.value = selectedItem.dataset.name;
                        additionalActions(selectedItem);
                        suggestionsContainer.innerHTML = '';
                    });
                });
            })
            .catch(error => {
                console.error('Error:', error);
                showNoResults(suggestionsContainer);
            });
    } else {
        suggestionsContainer.innerHTML = '';
    }
}

///////////////////////////////// LIBRARY >> ADD MEMBERS //////////
document.addEventListener("DOMContentLoaded", function () {
    const memberNameInput = document.getElementById('memberName');
    const suggestionsContainer = document.getElementById('suggestions');

    memberNameInput.addEventListener('input', function () {
        const query = this.value;
        fetchAndDisplaySuggestions(query, suggestionsContainer, memberNameInput, (selectedItem) => {
            document.getElementById('classFilter').value = selectedItem.dataset.standard;
            document.getElementById('contact').value = selectedItem.dataset.contact;
        });
    });

    document.addEventListener('click', function (event) {
        if (!suggestionsContainer.contains(event.target) && !memberNameInput.contains(event.target)) {
            suggestionsContainer.innerHTML = '';
        }
    });
});

///////////////////////////////// INVENTORY >> GENERATE INVOICE //////////
document.addEventListener("DOMContentLoaded", function () {
    const buyerNameInput = document.getElementById('buyerName');
    const suggestionsContainer = document.getElementById('suggestions');

    buyerNameInput.addEventListener('input', function () {
        const query = this.value;
        fetchAndDisplaySuggestions(query, suggestionsContainer, buyerNameInput, (selectedItem) => {
            document.getElementById('buyerMobile').value = selectedItem.dataset.contact;
        });
    });

    document.addEventListener('click', function (event) {
        if (!suggestionsContainer.contains(event.target) && !buyerNameInput.contains(event.target)) {
            suggestionsContainer.innerHTML = '';
        }
    });
});
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Function to fetch and display suggestions for manage students
function fetchAndDisplaySuggestionsformanagestudents(query, suggestionsContainer, inputField, additionalActions, sectionElementId) {
    const sectionSelect = document.getElementById(sectionElementId);
    const section = sectionSelect ? sectionSelect.value : '';

    // Only proceed if section is selected and query is long enough
    if (!section || query.length <= 1) {
        suggestionsContainer.innerHTML = '';
        return;
    }

    showLoading(suggestionsContainer);

    // Determine if query is a GR number (numeric) or name (text)
    const isGrno = /^\d+$/.test(query); // Check if query is all digits
    const url = isGrno 
        ? `/get-students-for-suggestion-manage-students?section=${section}&grno=${query}`
        : `/get-students-for-suggestion-manage-students?section=${section}&name=${encodeURIComponent(query)}`;

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            suggestionsContainer.innerHTML = '';
            if (!data || (Array.isArray(data) && data.length === 0) || data.message === "No students found") {
                showNoResults(suggestionsContainer);
            } else if (data.error) {
                console.error('Server error:', data.error);
                showNoResults(suggestionsContainer);
            } else {
                data.forEach(student => {
                    const suggestionItem = document.createElement('div');
                    suggestionItem.classList.add('suggestion-item');
                    suggestionItem.textContent = `${student.Grno} | ${student.Name} | ${student.Standard}`;
                    suggestionItem.dataset.Grno = student.Grno;
                    suggestionItem.dataset.name = student.Name;
                    suggestionItem.dataset.standard = student.Standard;
                    // Note: f_mobile_no isn't returned by the endpoint, so remove or fetch it separately if needed
                    suggestionsContainer.appendChild(suggestionItem);
                });

                // Add event listeners for selection
                suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', function () {
                        const selectedItem = this; // Use 'this' instead of event.target for consistency
                        inputField.value = selectedItem.dataset.name;
                        additionalActions(selectedItem);
                        suggestionsContainer.innerHTML = '';
                    });
                });
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            showNoResults(suggestionsContainer);
        });
}
//////////////////////////Update Student Enrollment Form (SMALLPOPUP)
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById('searchInput');
    const suggestionsContainer = document.getElementById('suggestions');
    const sectionSelect = document.getElementById('sectionSelect'); // Adjust ID if different
    const closeUpdateStudentOverlay = document.getElementById('closeUpdateStudentOverlay');

    // Disable/enable search input based on section selection
    function toggleSearchInput() {
        searchInput.disabled = !sectionSelect.value;
    }
    toggleSearchInput();
    sectionSelect.addEventListener('change', toggleSearchInput);

    // Clear input and suggestions when section changes
    sectionSelect.addEventListener('change', function () {
        searchInput.value = ''; // Empty the input
        suggestionsContainer.innerHTML = ''; // Clear suggestions
    });

    searchInput.addEventListener('input', function () {
        const query = this.value.trim();
        if (!query || !sectionSelect.value) {
            suggestionsContainer.innerHTML = '';
            return;
        }

        fetchAndDisplaySuggestionsformanagestudents(query, suggestionsContainer, searchInput, (selectedItem) => {
            searchInput.value = selectedItem.dataset.Grno;
            console.log(selectedItem);
        }, 'sectionSelect'); // Pass section element ID
    });

    document.addEventListener('click', function (event) {
        if (!suggestionsContainer.contains(event.target) && !searchInput.contains(event.target)) {
            suggestionsContainer.innerHTML = '';
        }
    });

      // Reset on closeUpdateStudentOverlay click
      if (closeUpdateStudentOverlay) {
        closeUpdateStudentOverlay.addEventListener('click', function () {
            searchInput.value = ''; // Clear input
            sectionSelect.selectedIndex = 0; // Reset to first option ("Select Section")
            suggestionsContainer.innerHTML = ''; // Clear suggestions
            toggleSearchInput();
        });
    };
});

//////////////////////////////Generate TC Form////////////////////////////////
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById('searchInputforTC');
    const suggestionsContainer = document.getElementById('TCsuggestions');
    const sectionSelect = document.getElementById('selectsectionforTC');
    const closeSearchTCFormOverlay = document.getElementById('closeSearchTCFormOverlay');

    // Disable/enable search input based on section selection
    function toggleSearchInput() {
        searchInput.disabled = !sectionSelect.value;
    }
    toggleSearchInput();
    sectionSelect.addEventListener('change', toggleSearchInput);

    // Clear input and suggestions when section changes
    sectionSelect.addEventListener('change', function () {
        searchInput.value = ''; // Empty the input
        suggestionsContainer.innerHTML = ''; // Clear suggestions
    });

    searchInput.addEventListener('input', function () {
        const query = this.value.trim();
        if (!query || !sectionSelect.value) {
            suggestionsContainer.innerHTML = '';
            return;
        }

        fetchAndDisplaySuggestionsformanagestudents(query, suggestionsContainer, searchInput, (selectedItem) => {
            searchInput.value = selectedItem.dataset.Grno;
        }, 'selectsectionforTC');
    });

    document.addEventListener('click', function (event) {
        if (!suggestionsContainer.contains(event.target) && !searchInput.contains(event.target)) {
            suggestionsContainer.innerHTML = '';
        }
    });

    // Reset on closeSearchTCFormOverlay click
    if (closeSearchTCFormOverlay) {
        closeSearchTCFormOverlay.addEventListener('click', function () {
            searchInput.value = ''; // Clear input
            sectionSelect.selectedIndex = 0; // Reset to first option ("Select Section")
            suggestionsContainer.innerHTML = ''; // Clear suggestions
            toggleSearchInput();
        });
    }
  
});