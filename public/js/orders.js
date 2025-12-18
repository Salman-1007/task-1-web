// Menu Toggle
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeBtn');
const overlayMenu = document.getElementById('overlayMenu');

if (menuBtn && overlayMenu && closeBtn) {
    menuBtn.addEventListener('click', () => {
        overlayMenu.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        overlayMenu.classList.remove('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.overlay a').forEach(link => {
        link.addEventListener('click', () => {
            overlayMenu.classList.remove('active');
        });
    });
}

// CRUD Application
$(document).ready(function() {
    const apiUrl = "https://usmanlive.com/wp-json/api/stories";
    let editingId = null;
    const spinner = $("#spinnerOverlay");
    const ordersCache = [];

    // Enhanced Toast function
    function showToast(message, type = "success") {
        const icon = type === "success" ? "✓" : type === "danger" ? "✖" : "ℹ";
        const toastHTML = `
            <div class="toast align-items-center text-bg-${type} border-0 show" role="alert">
                <div class="d-flex">
                    <div class="toast-body">
                        <strong>${icon}</strong> ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>`;
        $(".toast-container").append(toastHTML);
        setTimeout(() => {
            $(".toast").first().remove();
        }, 3000);
    }

    // Show/Hide Spinner
    function showSpinner() {
        spinner.addClass('active');
    }

    function hideSpinner() {
        spinner.removeClass('active');
    }

    // Update Statistics
    function updateStats(count) {
        $("#totalOrders").text(count);
    }

    // Load orders (READ - GET)
    function loadOrders() {
        showSpinner();

        $.ajax({
            url: apiUrl,
            method: "GET",
            success: function(data) {
                hideSpinner();
                ordersCache.length = 0;
                ordersCache.push(...data);
                renderOrders(data);
                updateStats(data.length);
            },
            error: function(xhr, status, error) {
                hideSpinner();
                console.error("Error loading orders:", error);
                showToast("Failed to load orders. Please try again.", "danger");
            }
        });
    }

    // Render orders in table
    function renderOrders(orders) {
        const tbody = $("#ordersTable");
        tbody.empty();

        if (orders.length === 0) {
            $("#emptyState").show();
            return;
        }

        $("#emptyState").hide();

        orders.forEach(order => {
            const row = `
                <tr data-order-id="${order.id}">
                    <td><span class="badge badge-id">#${order.id}</span></td>
                    <td><strong>${escapeHtml(order.title)}</strong></td>
                    <td>${escapeHtml(order.content)}</td>
                    <td class="text-center">
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-warning btn-action editBtn" 
                                    data-id="${order.id}" 
                                    data-title="${escapeHtml(order.title)}" 
                                    data-content="${escapeHtml(order.content)}"
                                    title="Edit Order">
                                ✏️ Edit
                            </button>
                            <button class="btn btn-sm btn-danger btn-action deleteBtn" 
                                    data-id="${order.id}"
                                    title="Delete Order">
                                🗑️ Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            tbody.append(row);
        });
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Form submit (CREATE - POST / UPDATE - PUT)
    $("#orderForm").submit(function(e) {
        e.preventDefault();

        const title = $("#orderTitle").val().trim();
        const content = $("#orderContent").val().trim();

        if (!title || !content) {
            showToast("Please fill in all required fields", "danger");
            return;
        }

        showSpinner();

        if (editingId) {
            // UPDATE (PUT)
            $.ajax({
                url: `${apiUrl}/${editingId}`,
                method: "PUT",
                contentType: "application/json",
                data: JSON.stringify({
                    title,
                    content
                }),
                success: function(response) {
                    hideSpinner();
                    showToast("Order updated successfully! ✓", "success");
                    loadOrders();
                    resetForm();
                },
                error: function(xhr, status, error) {
                    hideSpinner();
                    console.error("Error updating order:", error);
                    showToast("Failed to update order. Please try again.", "danger");
                }
            });
        } else {
            // CREATE (POST)
            $.ajax({
                url: apiUrl,
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    title,
                    content
                }),
                success: function(response) {
                    hideSpinner();
                    showToast("Order added successfully! ✓", "success");
                    loadOrders();
                    resetForm();
                },
                error: function(xhr, status, error) {
                    hideSpinner();
                    console.error("Error adding order:", error);
                    showToast("Failed to add order. Please try again.", "danger");
                }
            });
        }
    });

    // Edit button click
    $(document).on("click", ".editBtn", function() {
        editingId = $(this).data("id");
        const title = $(this).data("title");
        const content = $(this).data("content");

        $("#orderTitle").val(title);
        $("#orderContent").val(content);
        $("#editMode").val("true");
        $("#formTitle").html("✏️ Edit Order");
        $("#submitBtn").html("💾 Update Order").removeClass("btn-success").addClass("btn-primary");
        $("#cancelBtn").show();

        $('html, body').animate({
            scrollTop: $("#orderForm").offset().top - 100
        }, 500);

        showToast("Edit mode activated", "info");
    });

    // Cancel button
    $("#cancelBtn").click(function() {
        resetForm();
        showToast("Edit cancelled", "info");
    });

    // Delete button (DELETE)
    $(document).on("click", ".deleteBtn", function() {
        const id = $(this).data("id");
        const row = $(this).closest("tr");

        if (confirm("⚠️ Are you sure you want to delete this order?\n\nThis action cannot be undone.")) {
            showSpinner();

            $.ajax({
                url: `${apiUrl}/${id}`,
                method: "DELETE",
                success: function() {
                    hideSpinner();
                    showToast("Order deleted successfully! ✓", "success");
                    row.fadeOut(300, function() {
                        $(this).remove();
                        loadOrders();
                    });
                },
                error: function(xhr, status, error) {
                    hideSpinner();
                    console.error("Error deleting order:", error);
                    showToast("Failed to delete order. Please try again.", "danger");
                }
            });
        }
    });

    // Reset form
    function resetForm() {
        $("#orderForm")[0].reset();
        editingId = null;
        $("#editMode").val("false");
        $("#formTitle").html("➕ Add New Order");
        $("#submitBtn").html("💾 Save Order").removeClass("btn-primary").addClass("btn-success");
        $("#cancelBtn").hide();
    }

    // Initial load
    loadOrders();
});

