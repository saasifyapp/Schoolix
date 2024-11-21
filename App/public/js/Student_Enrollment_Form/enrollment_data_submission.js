
// Initialize an object to store all the form data
let formData = {
    studentInformation: {},
    guardianInformation: {},
    academicInformation: {},
    feesInformation: {},
    transportInformation: {}
};

// Function to collect data from the Student Information section
function collectStudentInformation() {
    formData.studentInformation = {
        firstName: document.getElementById('firstName').value.trim(),
        middleName: document.getElementById('middleName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        fullName: document.getElementById('fullName').value.trim(),
        dob: document.getElementById('dob').value,
        placeOfBirth: document.getElementById('placeOfBirth').value.trim(),
        age: document.getElementById('age').value.trim(),
        gender: document.getElementById('gender').value.trim(),
        bloodGroup: document.getElementById('bloodGroup').value.trim(),
        studentContact: document.getElementById('studentContact').value.trim(),
        currentAddress: {
            cityVillage: document.getElementById('city_village').value.trim(),
            taluka: document.getElementById('taluka').value.trim(),
            district: document.getElementById('district').value.trim(),
            state: document.getElementById('state').value.trim(),
            landmark: document.getElementById('landmak').value.trim(),
            pinCode: document.getElementById('pinCode').value.trim(),
        },
        nationality: document.getElementById('nationality').value.trim(),
        religion: document.getElementById('religion').value.trim(),
        category: document.getElementById('category').value.trim(),
        caste: document.getElementById('caste').value.trim(),
        domicile: document.getElementById('domicile').value.trim(),
        motherTongue: document.getElementById('motherTongue').value.trim(),
        aadharNo: document.getElementById('aadharNo').value.trim(),
        documents: Array.from(document.getElementById('documents').selectedOptions).map(option => option.value)
    };
}


// Function to collect data from the Guardian Information section
function collectGuardianInformation() {
    formData.guardianInformation = {
        father: {
            firstName: document.getElementById('fatherFirstName').value,
            middleName: document.getElementById('fatherMiddleName').value,
            lastName: document.getElementById('fatherLastName').value,
            fullName: document.getElementById('fatherFullName').value,
            contactNumber: document.getElementById('fatherContactNumber').value,
            qualification: document.getElementById('fatherQualification').value,
            occupation: document.getElementById('fatherOccupation').value
        },
        mother: {
            firstName: document.getElementById('motherFirstName').value,
            lastName: document.getElementById('motherLastName').value,
            fullName: document.getElementById('motherFullName').value,
            contactNumber: document.getElementById('motherContactNumber').value,
            qualification: document.getElementById('motherQualification').value,
            occupation: document.getElementById('motherOccupation').value
        },
        localGuardian: {
            name: document.getElementById('guardianName').value,
            contact: document.getElementById('guardianContact').value,
            relation: document.getElementById('guardianRelation').value,
            fullAddress: document.getElementById('guardian_fullAddress').value,
            landmark: document.getElementById('guardianAddressLandmark').value,
            pinCode: document.getElementById('guardianpinCode').value
        }
    };
}


// Function to collect data from the Academic Information section
function collectAcademicInformation() {
    formData.academicInformation = {
        section: document.getElementById('section').value,
        grNo: document.getElementById('grNo').value,
        admissionDate: document.getElementById('admissionDate').value,
        standard: document.getElementById('standard').value,
        division: document.getElementById('division').value,
        lastSchoolAttended: document.getElementById('lastSchoolAttended').value,
        classCompleted: document.getElementById('classCompleted').value,
        percentage: document.getElementById('percentage').value
    };
}

// Function to collect data from the Fees and Packages section
function collectFeesInformation() {
    formData.feesInformation = {
        feeSection: document.getElementById('feeSection').value,
        feeStandard: document.getElementById('feeStandard').value,
        feeDivision: document.getElementById('feeDivision').value,
        feeCategory: document.getElementById('feeCategory').value,
        packageAllotted: document.getElementById('packageAllotted').value
    };
}

// Function to collect data from the Transport Services section
function collectTransportInformation() {
    formData.transportInformation = {
        transportNeeded: document.querySelector('input[name="transportNeeded"]:checked') ? document.querySelector('input[name="transportNeeded"]:checked').value : null,
        transportStandard: document.getElementById('transportStandard').value,
        transportDivision: document.getElementById('transportDivision').value,
        pickDropAddress: document.getElementById('pickDropAddress').value,
        vehicleRunning: document.getElementById('vehicleRunning').value,
        vehicleDetails: document.getElementById('vehicleDetails').value
    };
}

// Collect data on "Next" button click and move to the next section
document.getElementById('student-next').addEventListener('click', function () {
    collectStudentInformation();
    // document.getElementById('student-information').style.display = 'none';
    // document.getElementById('guardian-information').style.display = 'block';
});

document.getElementById('guardian-next').addEventListener('click', function () {
    collectGuardianInformation();
    // document.getElementById('guardian-information').style.display = 'none';
    // document.getElementById('academic-information').style.display = 'block';
});

document.getElementById('academic-next').addEventListener('click', function () {
    collectAcademicInformation();
    // document.getElementById('academic-information').style.display = 'none';
    // document.getElementById('fees-information').style.display = 'block';
});

document.getElementById('fees-next').addEventListener('click', function () {
    collectFeesInformation();
    // document.getElementById('fees-information').style.display = 'none';
    // document.getElementById('transport-information').style.display = 'block';
});

document.getElementById('transport-next').addEventListener('click', function () {
    collectTransportInformation();
    // document.getElementById('transport-information').style.display = 'none';
    // document.getElementById('review-information').style.display = 'block';
    console.log('Form Data:', formData); // Display the collected form data in the console
});

// // Navigate back to previous sections
// document.getElementById('guardian-prev').addEventListener('click', function () {
//     document.getElementById('guardian-information').style.display = 'none';
//     document.getElementById('student-information').style.display = 'block';
// });

// document.getElementById('academic-prev').addEventListener('click', function () {
//     document.getElementById('academic-information').style.display = 'none';
//     document.getElementById('guardian-information').style.display = 'block';
// });

// document.getElementById('fees-prev').addEventListener('click', function () {
//     document.getElementById('fees-information').style.display = 'none';
//     document.getElementById('academic-information').style.display = 'block';
// });

// document.getElementById('transport-prev').addEventListener('click', function () {
//     document.getElementById('transport-information').style.display = 'none';
//     document.getElementById('fees-information').style.display = 'block';
// });

// document.getElementById('review-prev').addEventListener('click', function () {
//     document.getElementById('review-information').style.display = 'none';
//     document.getElementById('transport-information').style.display = 'block';
// });
