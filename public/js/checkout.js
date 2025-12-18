$(document).ready(function() {
    // jQuery Validation
    $("#checkoutForm").validate({
        rules: {
            fullName: {
                required: true,
                minlength: 3
            },
            phone: {
                required: true,
                minlength: 10,
                digits: true
            },
            address: {
                required: true,
                minlength: 10
            },
            city: {
                required: true,
                minlength: 3
            },
            email: {
                email: true
            },
            cardNumber: {
                required: function() {
                    return $("#card").is(":checked");
                },
                digits: true,
                minlength: 16,
                maxlength: 16
            },
            cardName: {
                required: function() {
                    return $("#card").is(":checked");
                },
                minlength: 3
            },
            expiry: {
                required: function() {
                    return $("#card").is(":checked");
                },
                minlength: 5
            },
            cvv: {
                required: function() {
                    return $("#card").is(":checked");
                },
                digits: true,
                minlength: 3,
                maxlength: 4
            }
        },
        messages: {
            fullName: {
                required: "Please enter your full name",
                minlength: "Name must be at least 3 characters"
            },
            phone: {
                required: "Please enter your phone number",
                minlength: "Phone number must be at least 10 digits",
                digits: "Please enter only numbers"
            },
            address: {
                required: "Please enter your address",
                minlength: "Address must be at least 10 characters"
            },
            city: {
                required: "Please enter your city",
                minlength: "City must be at least 3 characters"
            },
            email: {
                email: "Please enter a valid email address"
            },
            cardNumber: {
                required: "Please enter card number",
                digits: "Card number must contain only digits",
                minlength: "Card number must be 16 digits",
                maxlength: "Card number must be 16 digits"
            },
            cardName: {
                required: "Please enter cardholder name",
                minlength: "Name must be at least 3 characters"
            },
            expiry: {
                required: "Please enter expiry date",
                minlength: "Format should be MM/YY"
            },
            cvv: {
                required: "Please enter CVV",
                digits: "CVV must contain only digits",
                minlength: "CVV must be 3-4 digits"
            }
        },
        submitHandler: function(form) {
            // If validation passes, redirect to success page
            window.location.href = '/success';
            return false;
        }
    });
});

function selectPayment(element, type) {
    document.querySelectorAll('.payment-option').forEach(option => {
        option.classList.remove('selected');
    });
    element.classList.add('selected');
    document.getElementById(type).checked = true;
    const cardDetails = document.getElementById('cardDetails');
    if (type === 'card') {
        cardDetails.style.display = 'block';
        cardDetails.style.animation = 'slideIn 0.3s ease-out';
    } else {
        cardDetails.style.display = 'none';
    }
    // Revalidate form when payment method changes
    $("#checkoutForm").valid();
}

function applyPromo() {
    const promoCode = document.getElementById('promoCode').value.trim();
    const button = event.target;
    const originalText = button.innerHTML;
    if (!promoCode) {
        alert('Please enter a promo code.');
        return;
    }
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    button.disabled = true;
    setTimeout(() => {
        if (promoCode.toLowerCase() === 'save10') {
            alert('Promo code applied! You saved Rs. 200');
            document.getElementById('discount').textContent = '-Rs. 200';
            updateTotal();
        } else {
            alert('Invalid promo code. Try "SAVE10" for a discount!');
        }
        button.innerHTML = originalText;
        button.disabled = false;
    }, 1000);
}

function updateTotal() {
    const subtotal = 4500;
    const shipping = 150;
    const tax = 45;
    const discountText = document.getElementById('discount').textContent;
    const discount = discountText.includes('-') ? parseInt(discountText.replace(/[^\d]/g, '')) : 0;
    const total = subtotal + shipping + tax - discount;
    document.getElementById('total').textContent = `Rs. ${total.toLocaleString()}`;
}

document.addEventListener('DOMContentLoaded', function() {
    updateTotal();
});

