$(function() {
    $("#datepicker").datepicker({
        dateFormat: "yy-mm-dd",
        onSelect: function(dateText) {
            console.log("Selected date: " + dateText);

            $.ajax({
                url: '/inventory/invoice/query_by_date',
                type: 'GET',
                data: { date: dateText },
                success: function(data) {
                    console.log("Server response:", data);
                    
                    // Calculate sum of paid_amount for 'CASH' and 'UPI' modes for Collection Summary
                    let cashTotal = 0;
                    let upiTotal = 0;
                    data.forEach(entry => {
                        if (entry.mode_of_payment === 'CASH') {
                            cashTotal += entry.paid_amount;
                        } else if (entry.mode_of_payment === 'UPI') {
                            upiTotal += entry.paid_amount;
                        }
                    });

                    // Display sum of paid_amount for 'CASH' and 'UPI' modes in respective containers for Collection Summary
                    $(".box:eq(0)").text("CASH: " + cashTotal);
                    $(".box:eq(1)").text("UPI: " + upiTotal);
                    $(".box:eq(2)").text("TOTAL: " + (cashTotal + upiTotal));

                    // Display the selected date in the Collection Summary
                    $("#collection-date").text(dateText);

                    // Calculate total number of bills, net sell, received, and outstanding for Invoice Summary
                    let totalBills = data.length;
                    let netSell = data.reduce((acc, curr) => acc + curr.total_payable, 0);
                    let received = data.reduce((acc, curr) => acc + curr.paid_amount, 0);
                    let outstanding = data.reduce((acc, curr) => acc + curr.balance_amount, 0);

                    // Update the HTML content with the calculated values for Invoice Summary
                    $(".box:eq(3)").text("Total Bills: " + totalBills);
                    $(".box:eq(4)").text("Net Sell: " + netSell);
                    $(".box:eq(5)").text("Received: " + received);
                    $(".box:eq(6)").text("Outstanding: " + outstanding);

                    // Display the selected date in the Invoice Summary
                    $("#invoice-date").text(dateText);
                },
                error: function(xhr, status, error) {
                    console.error("Error fetching data:", error);
                }
            });
        }
    });
});
