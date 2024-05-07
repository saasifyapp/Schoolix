function showCustomAlert() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("customAlert").style.display = "flex";

}



document.getElementById("calculateButton").addEventListener("click", function () {


    var birthdate = document.getElementById("birthdate").value;
    var today = new Date();


    var birthDate = new Date(birthdate);

    if (!birthdate) {
        // alert("Please select a date.");
        showToast('Please select a date.', true); // Show error toast
        return;
    }


    if (birthDate > today) {
        // alert("Select a date before :" + today.getDate() + "-" + (today.getMonth() + 1) + "-" + today.getFullYear());
        showToast('Please select a valid date', true); // Show error toast
        return;
    }


    var years = today.getFullYear() - birthDate.getFullYear();
    var months = today.getMonth() - birthDate.getMonth();
    var days = today.getDate() - birthDate.getDate();

    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
        years--;
        months += 12;
    }

    if (days < 0) {
        var lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 0);
        days += lastMonth.getDate();
        months--;
    }

    var current_age = years + " Years " + months + " Months " + days + " Days ";   // Current Age

    var current_year = today.getFullYear();
    var specificDate = new Date(current_year, 11, 31);  // Month starts fom index 0

    var years_1 = specificDate.getFullYear() - birthDate.getFullYear();
    var months_1 = specificDate.getMonth() - birthDate.getMonth();
    var days_1 = specificDate.getDate() - birthDate.getDate();

    if (months_1 < 0 || (months_1 === 0 && specificDate.getDate() < birthDate.getDate())) {
        years_1--;
        months_1 += 12;
    }

    if (days_1 < 0) {
        var lastMonth = new Date(specificDate.getFullYear(), specificDate.getMonth() - 1, 0);
        days_1 += lastMonth.getDate();
        months_1--;
    }

    var age_on_date = years_1 + " Years " + months_1 + " Months " + days_1 + " Days ";  // Age on 31st December 

    var show_class = "";
    if ((years_1 >= 3 && years_1 <= 4)) {
        if (years_1 == 3) { show_class = "Nursery"; }
        else if (years_1 == 4 && months_1 <= 5 && days_1 <= 30) { show_class = "Nursery / KG-1"; }
        else if (years_1 == 4 && months_1 >= 5 && days_1 <= 30) { show_class = "KG-1"; }
        else if (years_1 == 4 && months_1 == 5 && days_1 >= 30) { show_class = "KG-1"; }
    } else if ((years_1 >= 4 && years_1 <= 5)) {
        if (years_1 == 4) { show_class = "KG-1"; }
        else if (years_1 == 5 && months_1 <= 5 && days_1 <= 30) { show_class = "KG-1 / KG-2"; }
        else if (years_1 == 5 && months_1 >= 5 && days_1 <= 30) { show_class = "KG-2"; }
        else if (years_1 == 5 && months_1 == 5 && days_1 >= 30) { show_class = "KG-2"; }
    } else if ((years_1 >= 5 && years_1 <= 6)) {
        if (years_1 == 5) { show_class = "KG-2"; }
        else if (years_1 == 6 && months_1 <= 5 && days_1 <= 30) { show_class = "KG-2 / 1 ST"; }
        else if (years_1 == 6 && months_1 >= 5 && days_1 <= 30) { show_class = "1 ST"; }
        else if (years_1 == 6 && months_1 == 5 && days_1 >= 30) { show_class = "1 ST"; }
    } else if ((years_1 >= 6 && years_1 <= 7)) {
        if (years_1 == 6) { show_class = "1 ST"; }
        else if (years_1 == 7 && months_1 <= 5 && days_1 <= 30) { show_class = "1 ST / 2ND"; }
        else if (years_1 == 7 && months_1 >= 5 && days_1 <= 30) { show_class = "2 ND"; }
        else if (years_1 == 7 && months_1 == 5 && days_1 >= 30) { show_class = "2 ND"; }
    } else if ((years_1 >= 7 && years_1 <= 8)) {
        if (years_1 == 7) { show_class = "2 ND"; }
        else if (years_1 == 8 && months_1 <= 5 && days_1 <= 30) { show_class = "2 ND / 3RD"; }
        else if (years_1 == 8 && months_1 >= 5 && days_1 <= 30) { show_class = "3 RD"; }
        else if (years_1 == 8 && months_1 == 5 && days_1 >= 30) { show_class = "3 RD"; }
    } else if ((years_1 >= 8 && years_1 <= 9)) {
        if (years_1 == 8) { show_class = "3 RD"; }
        else if (years_1 == 9 && months_1 <= 5 && days_1 <= 30) { show_class = "3 RD / 4 TH"; }
        else if (years_1 == 9 && months_1 >= 5 && days_1 <= 30) { show_class = "4 TH"; }
        else if (years_1 == 9 && months_1 == 5 && days_1 >= 30) { show_class = "4 TH"; }
    } else if ((years_1 >= 9 && years_1 <= 10)) {
        if (years_1 == 9) { show_class = "4th"; }
        else if (years_1 == 10 && months_1 <= 5 && days_1 <= 30) { show_class = "4 TH / 5 TH"; }
        else if (years_1 == 10 && months_1 >= 5 && days_1 <= 30) { show_class = "5 TH"; }
        else if (years_1 == 10 && months_1 == 5 && days_1 >= 30) { show_class = "5 TH"; }
    } else if ((years_1 >= 10 && years_1 <= 11)) {
        if (years_1 == 10) { show_class = "5 TH"; }
        else if (years_1 == 11 && months_1 <= 5 && days_1 <= 30) { show_class = "5 TH / 6 TH"; }
        else if (years_1 == 11 && months_1 >= 5 && days_1 <= 30) { show_class = "6 TH"; }
        else if (years_1 == 11 && months_1 == 5 && days_1 >= 30) { show_class = "6 TH"; }
    } else if ((years_1 >= 11 && years_1 <= 12)) {
        if (years_1 == 11) { show_class = "6 TH"; }
        else if (years_1 == 12 && months_1 <= 5 && days_1 <= 30) { show_class = "6 TH / 7 TH"; }
        else if (years_1 == 12 && months_1 >= 5 && days_1 <= 30) { show_class = "7 TH"; }
        else if (years_1 == 12 && months_1 == 5 && days_1 >= 30) { show_class = "7 TH"; }
    } else if ((years_1 >= 12 && years_1 <= 13)) {
        if (years_1 == 12) { show_class = "7 TH"; }
        else if (years_1 == 13 && months_1 <= 5 && days_1 <= 30) { show_class = "7 TH / 8 TH"; }
        else if (years_1 == 13 && months_1 >= 5 && days_1 <= 30) { show_class = "8 TH"; }
        else if (years_1 == 13 && months_1 == 5 && days_1 >= 30) { show_class = "8 TH"; }
    } else if ((years_1 >= 13 && years_1 <= 14)) {
        if (years_1 == 13) { show_class = "8 TH"; }
        else if (years_1 == 14 && months_1 <= 5 && days_1 <= 30) { show_class = "8 TH / 9 TH"; }
        else if (years_1 == 14 && months_1 >= 5 && days_1 <= 30) { show_class = "9 TH"; }
        else if (years_1 == 14 && months_1 == 5 && days_1 >= 30) { show_class = "9 TH"; }
    } else if ((years_1 >= 14 && years_1 <= 15)) {
        if (years_1 == 14) { show_class = "9 TH"; }
        else if (years_1 == 15 && months_1 <= 5 && days_1 <= 30) { show_class = "9 TH / 10 TH"; }
        else if (years_1 == 15 && months_1 >= 5 && days_1 <= 30) { show_class = "10 TH"; }
        else if (years_1 == 15 && months_1 == 5 && days_1 >= 30) { show_class = "10 TH"; }
    } 
    
    else if (years_1 >= 16) { show_class = "OUT OF SCHOOL"; }
    else if (years_1 < 3) { show_class = "VISIT NEXT YEAR"; }
    

    var outputDiv = document.getElementById("output");
    outputDiv.innerHTML = `
    <table class="age-table">
        <tr>
            <td>Current Age:</td>
            <td>${current_age}</td>
        </tr>
        <tr>
            <td>Age as of 31 Dec ${today.getFullYear()}:</td>
            <td>${age_on_date}</td>
        </tr>
        <tr>
            <td>Class of Admission:</td>
            <td>${show_class}</td>
        </tr>
    </table>
`;



})




function clearPrompt() {
    document.getElementById("birthdate").value = ""; // Clear the date input field
    document.getElementById("output").innerHTML = ""; // Clear the inner HTML of show_age_details
}


document.getElementById("close_btn").addEventListener("click", function() {

    document.getElementById("birthdate").value = ""; // Clear the date input field
    document.getElementById("output").innerHTML = ""; // Clear the inner HTML of show_age_details

    document.getElementById("customAlert").style.display = "none";
    document.getElementById("overlay").style.display = "none"; // Hide the overlay
});

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
