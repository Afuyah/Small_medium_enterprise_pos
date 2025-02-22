
/**
 * Retrieve the shopping cart data from local storage or initialize an empty cart.
 * This ensures that cart data persists across page reloads.
 */
let cart = JSON.parse(localStorage.getItem('cart')) || [];

/**
 * Event listener for category selection.
 * Fetches and displays products for the selected category using an AJAX request.
 */
$(document).on('click', '.category-item', function () {
    const categoryId = $(this).data('category'); // Get selected category ID

    // Show a loading message while fetching products
    $('#product-list').html('<p>Loading products...</p>');
    $('#no-products').hide();

    $.ajax({
        url: `/sales/api/products/${categoryId}`,  // API endpoint for fetching products by category
        method: 'GET',
        success: function (data) {
            if (data.products && data.products.length > 0) {
                populateProducts(data.products);  // Populate the product list with fetched data
            } else {
                $('#product-list').empty(); // Clear product list
                $('#no-products').show();  // Show "No products available" message
            }
        },
        error: function () {
            showError('Failed to load products. Please try again.'); // Handle API request failure
            $('#product-list').empty();
        }
    });
});

/**
 * Utility function to format currency values consistently.
 * Ensures prices have two decimal places.
 * 
 * @param {number} value - The numeric value to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(value) {
    return parseFloat(value).toFixed(2);
}

/**
 * Populates the product list dynamically based on fetched product data.
 * Generates HTML elements for each product and appends them to the product list.
 * 
 * @param {Array} products - Array of product objects to display
 */
function populateProducts(products) {
    $('#product-list').empty(); // Clear previous products

    if (products.length === 0) {
        $('#product-list').append('<p class="text-muted">No products available.</p>');
        return;
    }

    products.forEach(product => {
        // Display a low stock warning if stock is below 5
        let lowStockWarning = product.stock < 5 ? `<span class="text-danger">(Low)</span>` : '';
        
        // Display combination pricing if applicable
        let combinationText = product.combination_size > 1 
            ? `(${product.combination_size} @ Ksh ${formatCurrency(product.combination_price || 0)})` 
            : '';

        // Append product card to the list
        $('#product-list').append(`
            <div class="product-item border border-primary rounded p-2 mb-3 ${product.stock === 0 ? 'disabled-card' : 'clickable'}" 
                 data-id="${product.id}" 
                 data-name="${product.name}" 
                 data-selling-price="${formatCurrency(product.selling_price || 0)}" 
                 data-combination-price="${formatCurrency(product.combination_price || 0)}" 
                 data-combination-unit-price="${formatCurrency(product.combination_unit_price || 0)}" 
                 data-stock="${product.stock}" 
                 data-combination-size="${product.combination_size || 1}">
                <h5 class="product-title">${product.name} ${lowStockWarning}</h5>
                <p class="product-price">Ksh ${formatCurrency(product.selling_price || 0)} ${combinationText}</p>
                <p class="product-stock">Stock: ${product.stock}</p>
            </div>
        `);
    });
}

/**
 * Displays error messages in a user-friendly way.
 * Can be enhanced to use a toast notification or modal instead of an alert.
 * 
 * @param {string} message - The error message to display
 */
function showError(message) {
    alert(message);  // Replace with a better UI notification if needed
}



// Function to save cart to localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Function to load cart from localStorage (ensure persistence)
function loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
}

// Function to update cart display and calculate total
function updateCart() {
    $('#cart-items').empty();
    let total = 0;

    cart.forEach(item => {
        let subtotal = 0;
        const combinationSize = item.combination_size || 1;
        const fullCombinations = Math.floor(item.quantity / combinationSize);
        const remainingUnits = item.quantity % combinationSize;
        
        subtotal += fullCombinations * item.combination_price;
        const individualRemainderPrice = remainingUnits * item.selling_price;
        
        if (remainingUnits > 0) {
            subtotal += Math.min(individualRemainderPrice, item.combination_price);
        }
        
        total += subtotal;

        $('#cart-items').append(`
            <div class="cart-item d-flex justify-content-between align-items-center p-2 border-bottom">
                <span>${item.name} - Ksh ${item.selling_price.toFixed(2)} x ${item.quantity}</span>
                <span class="fw-bold text-primary">= Ksh ${subtotal.toFixed(2)}</span>
                <button class="btn btn-danger btn-sm remove-from-cart" data-id="${item.id}">&times;</button>
            </div>
        `);
    });

    $('#total-amount').text(total.toFixed(2));

    if (cart.length === 0) {
        $('#cart-items').append('<p class="text-muted text-center">Your cart is empty.</p>');
    }

    saveCartToLocalStorage();
}

// Remove item from cart with animation
$(document).on('click', '.remove-from-cart', function () {
    const itemId = $(this).data('id');
    const index = cart.findIndex(item => item.id === itemId);

    if (index !== -1) {
        $(this).closest('.cart-item').fadeOut(300, function () {
            cart.splice(index, 1);
            updateCart();
        });
    }
});

// Logout button event to clear the cart
$(document).on('click', '#logout-button', function () {
    localStorage.removeItem('cart');
    window.location.href = "/auth/logout";
});

// Load cart from localStorage when the page loads
$(document).ready(function () {
    loadCartFromLocalStorage();
    updateCart();
});



// Add item to cart on product click
$(document).on('click', '.product-item.clickable', function () {
    const productId = $(this).data('id');
    const productName = $(this).data('name');
    const productSellingPrice = parseFloat($(this).data('selling-price')) || 0;
    const productCombinationPrice = parseFloat($(this).data('combination-price')) || 0;
    const productCombinationUnitPrice = parseFloat($(this).data('combination-unit-price')) || 0;
    const productStock = parseInt($(this).data('stock')) || 0;
    const combinationSize = parseInt($(this).data('combination-size')) || 1;

    if (productStock === 0) {
        showError(`"${productName}" is currently out of stock.`);
        return;
    }

    let existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        if (existingItem.quantity < productStock) {
            existingItem.quantity += 1;
        } else {
            showError(`Cannot add more of "${productName}". Stock limit reached.`);
            return;
        }
    } else {
        cart.push({
            id: productId,
            name: productName,
            selling_price: productSellingPrice,
            combination_price: productCombinationPrice,
            combination_unit_price: productCombinationUnitPrice,
            quantity: 1,
            combination_size: combinationSize
        });
    }

    updateCart();
});

// Remove item from cart with animation
$(document).on('click', '.remove-from-cart', function () {
    const productId = $(this).data('id');
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex !== -1) {
        $(this).closest('.cart-item').fadeOut(300, function () {
            cart.splice(itemIndex, 1);
            updateCart();
        });
    }
});

// Clear cart button event
$(document).on('click', '#clear-cart', function () {
    if (cart.length === 0) {
        showError("Cart is already empty.");
        return;
    }

    if (confirm("Are you sure you want to clear the cart?")) {
        cart = [];
        localStorage.removeItem('cart');
        updateCart();
    }
});

// Function to save cart to localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Function to load cart from localStorage (ensuring persistence)
function loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
}

// Function to update cart display and calculate total
function updateCart() {
    $('#cart-items').empty();
    let total = 0;

    cart.forEach(item => {
        let subtotal = 0;
        const fullCombinations = Math.floor(item.quantity / item.combination_size);
        const remainingUnits = item.quantity % item.combination_size;
        
        subtotal += fullCombinations * item.combination_price;
        const individualRemainderPrice = remainingUnits * item.selling_price;
        
        if (remainingUnits > 0) {
            subtotal += Math.min(individualRemainderPrice, item.combination_price);
        }
        
        total += subtotal;

        $('#cart-items').append(`
            <div class="cart-item d-flex justify-content-between align-items-center p-2 border-bottom">
                <span>${item.name} - Ksh ${item.selling_price.toFixed(2)} x ${item.quantity}</span>
                <span class="fw-bold text-primary">= Ksh ${subtotal.toFixed(2)}</span>
                <button class="btn btn-danger btn-sm remove-from-cart" data-id="${item.id}">&times;</button>
            </div>
        `);
    });

    $('#total-amount').text(total.toFixed(2));

    if (cart.length === 0) {
        $('#cart-items').append('<p class="text-muted text-center">Your cart is empty.</p>');
    }

    saveCartToLocalStorage();
}

// Load cart from localStorage when the page loads
$(document).ready(function () {
    loadCartFromLocalStorage();
    updateCart();
});

// Function to show errors (replace alert with a better UI modal/toast)
function showError(message) {
    alert(message); // Can be replaced with a Bootstrap toast or modal
}



$(document).ready(function() {
    updateCart(); // Ensure cart UI is updated on page load
    $('#error-message').hide(); // Hide error message initially
});

// Handle payment method change
$('#payment-method').change(function () {
    const selectedMethod = $(this).val();
    const customerNameContainer = $('#customer-name-container');

    if (selectedMethod === 'credit') {
        customerNameContainer.slideDown(200); // Smoothly show input
    } else {
        customerNameContainer.slideUp(200); // Smoothly hide input
        $('#customer-name').val(''); // Clear input if not needed
    }
});

// Function to show error messages with animation
function showError(message) {
    const errorBox = $('#error-message');
    
    errorBox.text(message).fadeIn(300);
    
    setTimeout(() => {
        errorBox.fadeOut(300);
    }, 3000); // Auto-hide after 3 seconds
}

// Function to reset checkout form
function resetCheckoutForm() {
    $('#payment-method').val('').trigger('change'); // Reset and trigger change event
    $('#customer-name').val('');
    $('#error-message').fadeOut(300); // Hide error message
}






// Handle checkout
$('#checkout-btn').click(function () {
    if (cart.length === 0) {
        showError('Your cart is empty!');
        return;
    }

    // Populate the confirmation modal with cart items
    $('#checkout-items-list').empty(); // Clear previous items
    let total = 0;

    cart.forEach(item => {
        let subtotal = 0;
        const fullCombinations = Math.floor(item.quantity / item.combination_size);
        const remainingUnits = item.quantity % item.combination_size;

        subtotal += fullCombinations * item.combination_price;
        const individualRemainderPrice = remainingUnits * item.selling_price;
        const additionalCombinationPrice = item.combination_price;

        if (remainingUnits > 0) {
            subtotal += Math.min(individualRemainderPrice, additionalCombinationPrice);
        }

        total += subtotal;

        // Append item to the confirmation modal display
        $('#checkout-items-list').append(`
            <div class="checkout-item">
                ${item.name} - Ksh ${item.selling_price.toFixed(2)} x ${item.quantity} = Ksh ${subtotal.toFixed(2)}
            </div>
        `);
    });

    $('#checkout-total-amount').text(total.toFixed(2)); // Update the total amount display

    // Show the confirmation modal
    $('#checkoutConfirmationModal').modal('show');
});



// Confirm checkout button in modal
$(document).on('click', '#confirm-checkout-btn', function () {
    const checkoutButton = $('#checkout-btn');
    checkoutButton.prop('disabled', true); // Disable the original checkout button
    $('#checkout-loading').show(); // Show loading indicator

    const paymentMethod = $('#payment-method').val();
    const customerName = paymentMethod === 'credit' ? $('#customer-name').val().trim() : null;

    // Validate customer name if payment method is credit
    if (paymentMethod === 'credit' && !customerName) {
        showError('Please enter customer name for credit payments.');
        $('#customer-name').addClass('is-invalid'); // Highlight invalid input
        checkoutButton.prop('disabled', false); // Re-enable the checkout button
        $('#checkout-loading').hide(); // Hide loading indicator
        return;
    } else {
        $('#customer-name').removeClass('is-invalid'); // Remove highlight if valid
    }

    $.ajax({
        url: '/sales/checkout', // Adjust to your actual checkout endpoint
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ cart: cart, payment_method: paymentMethod, customer_name: customerName }),
        success: function () {
            $('#successModal').modal('show'); // Show success modal
            cart = []; // Clear cart
            updateCart(); // Update cart display
            resetCheckoutForm(); // Reset the form
        },
        error: function (xhr) {
            const errorMessage = xhr.responseJSON && xhr.responseJSON.message 
                ? xhr.responseJSON.message 
                : 'Checkout failed. Please try again.';
            showError(errorMessage);
        },
        complete: function () {
            checkoutButton.prop('disabled', false); // Re-enable the original checkout button
            $('#checkout-loading').hide(); // Hide loading indicator
            $('#checkoutConfirmationModal').modal('hide'); // Hide confirmation modal
        }
    });
});


// Function to reset the checkout form
function resetCheckoutForm() {
    $('#payment-method').val('mpesa'); // Set to default payment method
    $('#customer-name').val(''); // Clear customer name
    $('#customer-name-container').hide(); // Hide customer name input
}

// Debounce function to limit the frequency of search execution
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Function to highlight matching text
function highlightMatch(text, searchTerm) {
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>'); // Wrap matches in a span for styling
}



// Search functionality for products and categories
const searchProductsAndCategories = debounce(function () {
    const searchTerm = $(this).val().toLowerCase();

    // Filter products
    $('.product-item').filter(function() {
        const productTitle = $(this).find('.product-title');
        const isVisible = productTitle.text().toLowerCase().includes(searchTerm);
        productTitle.html(isVisible ? highlightMatch(productTitle.text(), searchTerm) : productTitle.text()); // Highlight matches
        $(this).toggle(isVisible);
    });

    // Show or hide no products message
    $('#no-products').toggle($('#product-list').children(':visible').length === 0);

    // Filter categories
    $('.category-item').filter(function() {
        const isVisible = $(this).text().toLowerCase().includes(searchTerm);
        $(this).toggle(isVisible);
    });
}, 300); // Example delay of 300 ms for debouncing

// Event listener for search input
$('#search-input').on('input', searchProductsAndCategories);

// Function to highlight matched text in search results
function highlightMatch(text, term) {
    const escapedTerm = term.replace(/[-\/\\^$.*+?()[\]{}|]/g, '\\$&'); // Escape special regex characters
    const regex = new RegExp(`(${escapedTerm})`, 'gi'); // Case insensitive match
    return text.replace(regex, '<span class="highlight">$1</span>'); // Wrap matched text in a span for styling
}

// Attach the debounced search function to input event
$('#search').on('input', debounce(function() {
    const searchTerm = $(this).val();
    if (searchTerm.trim() !== '') { // Only highlight if the input is not empty
        searchProductsAndCategories.call(this);
    }
}, 300));

// Utility function to show error messages
function showError(message) {
    $('#error-message').text(message).show(); // Display error message
    $('#error-message').addClass('error-highlight'); // Add a class for styling
    setTimeout(() => {
        $('#error-message').removeClass('error-highlight'); // Remove class before hiding
        $('#error-message').hide(); // Hide after 5 seconds
    }, 5000); // Hide after 5 seconds
}


// Function to handle card animations and display adjustments
function animateCardsOnHover() {
    const productItems = document.querySelectorAll('.product-item');
    productItems.forEach(item => {
        item.addEventListener('mouseover', () => {
            item.style.transform = 'scale(1.02)';
        });
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'scale(1)';
        });
    });
}

document.addEventListener('DOMContentLoaded', animateCardsOnHover);