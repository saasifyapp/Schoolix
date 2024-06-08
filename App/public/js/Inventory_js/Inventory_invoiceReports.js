$(function () {
    // Initialize datepicker
    $("#datepicker").datepicker({
        dateFormat: "yy-mm-dd",
        onSelect: function (dateText) {
            fetchDataByDate(dateText);
        }
    });

    // Set datepicker to today's date and manually trigger onSelect function for today's date
    let today = $.datepicker.formatDate("yy-mm-dd", new Date());
    $("#datepicker").datepicker("setDate", today);
    fetchDataByDate(today);

    // Event listener for class dropdown
    $("#filter-class").change(function () {
        let selectedClass = $(this).val();
        fetchDataByClass(selectedClass);
    });

    // Event listener for defaulter switch
    $("#defaulter-switch").change(function () {
        if ($(this).is(":checked")) {
            fetchDataByDefaulter(true);
        } else {
            let selectedClass = $("#filter-class").val();
            fetchDataByClass(selectedClass);
        }
    });

    // Fetch data by date
    function fetchDataByDate(dateText) {
        $.ajax({
            url: '/inventory/invoice/query_by_date',
            type: 'GET',
            data: { date: dateText },
            success: function (data) {
                updateUI(data, dateText);
            },
            error: function (xhr, status, error) {
                console.error("Error fetching data:", error);
            }
        });
    }

    // Fetch data by class
    function fetchDataByClass(classOfBuyer) {
        $.ajax({
            url: '/inventory/invoice/query_by_class',
            type: 'GET',
            data: { class: classOfBuyer },
            success: function (data) {
                updateUI(data, classOfBuyer);
            },
            error: function (xhr, status, error) {
                console.error("Error fetching data:", error);
            }
        });
    }

    // Fetch data for defaulter list
    function fetchDataByDefaulter(isDefaulter) {
        $.ajax({
            url: '/inventory/invoice/query_by_defaulter',
            type: 'GET',
            data: { defaulter: isDefaulter },
            success: function (data) {
                updateUI(data, "Defaulter List");
            },
            error: function (xhr, status, error) {
                console.error("Error fetching data:", error);
            }
        });
    }

    // Update the UI with fetched data
function updateUI(data, filterValue) {
    // Calculate and update Collection Summary
    let cashTotal = 0;
    let upiTotal = 0;
    data.forEach(entry => {
        if (entry.mode_of_payment === 'CASH') {
            cashTotal += entry.paid_amount;
        } else if (entry.mode_of_payment === 'UPI') {
            upiTotal += entry.paid_amount;
        }
    });
    $(".box:eq(0)").text("CASH: " + cashTotal);
    $(".box:eq(1)").text("UPI: " + upiTotal);
    $(".box:eq(2)").text("TOTAL: " + (cashTotal + upiTotal));

    // Update Collection Summary date/class
    if (!isDate(filterValue)) {
        $("#collection-date").text(filterValue); // Display selected class or defaulter list
    } else {
        $("#collection-date").text(filterValue);
    }

    // Calculate and update Invoice Summary
    let totalBills = data.length;
    let netSell = data.reduce((acc, curr) => acc + curr.total_payable, 0);
    let received = data.reduce((acc, curr) => acc + curr.paid_amount, 0);
    let outstanding = data.reduce((acc, curr) => acc + curr.balance_amount, 0);
    $(".box:eq(3)").text("Total Bills: " + totalBills);
    $(".box:eq(4)").text("Net Sell: " + netSell);
    $(".box:eq(5)").text("Received: " + received);
    $(".box:eq(6)").text("Outstanding: " + outstanding);

    // Update Invoice Summary date/class
    if (!isDate(filterValue)) {
        $("#invoice-date").text(filterValue); // Display selected class or defaulter list
    } else {
        $("#invoice-date").text(filterValue);
    }

    // Update table heading dynamically
    let tableHeading = "";
    if (filterValue === "Defaulter List") {
        tableHeading = "Defaulter Details";
    } else if (!isDate(filterValue)) {
        tableHeading = "Bills for Class - " + filterValue;
    } else {
        tableHeading = "Bills for " + filterValue;
    }
    $("#table-heading").text(tableHeading);

    // Populate table with fetched data
    let tableRows = '';
    data.forEach(entry => {
        tableRows += `
            <tr>
                <td>${entry.invoiceNo}</td>
                <td>${entry.billDate}</td>
                <td>${entry.buyerName}</td>
                <td>${entry.buyerPhone}</td>
                <td>${entry.class_of_buyer}</td>
                <td>${entry.total_payable}</td>
                <td>${entry.paid_amount}</td>
                <td>${entry.balance_amount}</td>
                <td>${entry.mode_of_payment}</td>
            </tr>
        `;
    });
    $("#invoice-table tbody").html(tableRows);
}

    // Utility function to check if filterValue is a date
    function isDate(value) {
        return /^\d{4}-\d{2}-\d{2}$/.test(value);
    }
});
