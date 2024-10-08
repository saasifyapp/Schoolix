// FOR LIBRARY >> ADD MEMBERS //
document.addEventListener("DOMContentLoaded", function () {
    const memberNameInput = document.getElementById('memberName');
    const suggestionsContainer = document.getElementById('suggestions');

    memberNameInput.addEventListener('input', function () {
        suggestionsContainer.style.display = "flex";
        const query = this.value;
        if (query.length > 2) {
            fetch(`/get_student_details?q=${query}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Fetched data:', data); // Log the fetched data
                    suggestionsContainer.innerHTML = '';

                    if (data.length === 0) {
                        // If no results are found
                        const noResultsItem = document.createElement('div');
                        noResultsItem.classList.add('suggestion-item', 'no-results');
                        noResultsItem.textContent = 'No results found';
                        suggestionsContainer.appendChild(noResultsItem);
                    } else {
                        data.forEach(student => {
                            const suggestionItem = document.createElement('div');
                            suggestionItem.classList.add('suggestion-item');
                            suggestionItem.textContent = `${student.Name} | ${student.Standard}`;
                            suggestionItem.dataset.name = student.Name;
                            suggestionItem.dataset.standard = student.Standard; // Assuming standard field exists
                            suggestionItem.dataset.contact = student.f_mobile_no; // Assuming contact field exists
                            suggestionsContainer.appendChild(suggestionItem);
                        });
                    }
                })
                .catch(error => console.error('Error:', error));
        } else {
            suggestionsContainer.innerHTML = '';
        }
    });

    suggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedStudent = event.target;
            console.log('Selected student details:', {
                name: selectedStudent.dataset.name,
                standard: selectedStudent.dataset.standard,
                contact: selectedStudent.dataset.contact
            }); // Log the selected student details

            memberNameInput.value = selectedStudent.dataset.name;
            document.getElementById('classFilter').value = selectedStudent.dataset.standard;
            document.getElementById('contact').value = selectedStudent.dataset.contact;
            suggestionsContainer.innerHTML = '';
        }
    });

    document.addEventListener('click', function (event) {
        if (!suggestionsContainer.contains(event.target) && !memberNameInput.contains(event.target)) {
            suggestionsContainer.innerHTML = '';
        }
    });
});

// FOR INVENTORY >> GENERATE INVOICE //
document.addEventListener("DOMContentLoaded", function () {
    const buyerNameInput = document.getElementById('buyerName');
    const suggestionsContainer = document.getElementById('suggestions');

    buyerNameInput.addEventListener('input', function () {
        suggestionsContainer.style.display = "flex";
        const query = this.value;
        if (query.length > 2) {
            fetch(`/get_student_details?q=${query}`)
                .then(response => response.json())
                .then(data => {
                    console.log('Fetched data:', data); // Log the fetched data
                    suggestionsContainer.innerHTML = '';
                    if (data.length === 0) {
                        // If no results are found
                        const noResultsItem = document.createElement('div');
                        noResultsItem.classList.add('suggestion-item', 'no-results');
                        noResultsItem.textContent = 'No results found';
                        suggestionsContainer.appendChild(noResultsItem);
                    } else {
                    data.forEach(student => {
                        const suggestionItem = document.createElement('div');
                        suggestionItem.classList.add('suggestion-item');
                        suggestionItem.textContent = `${student.Name} | ${student.Standard}`;
                        suggestionItem.dataset.name = student.Name;
                        suggestionItem.dataset.standard = student.Standard; // Assuming standard field exists
                        suggestionItem.dataset.contact = student.f_mobile_no; // Assuming contact field exists
                        suggestionsContainer.appendChild(suggestionItem);
                    });
                }
                })
                .catch(error => console.error('Error:', error));
        } else {
            suggestionsContainer.innerHTML = '';
        }
    });

    suggestionsContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('suggestion-item')) {
            const selectedStudent = event.target;
            console.log('Selected student details:', {
                name: selectedStudent.dataset.name,
                standard: selectedStudent.dataset.standard,
                contact: selectedStudent.dataset.contact
            }); // Log the selected student details

            buyerNameInput.value = selectedStudent.dataset.name;
            document.getElementById('buyerMobile').value = selectedStudent.dataset.contact;
            //document.getElementById('buyerClass').value = selectedStudent.dataset.standard;
            suggestionsContainer.innerHTML = '';
        }
    });

    document.addEventListener('click', function (event) {
        if (!suggestionsContainer.contains(event.target) && !buyerNameInput.contains(event.target)) {
            suggestionsContainer.innerHTML = '';
        }
    });
});