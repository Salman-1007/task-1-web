// Admin Panel JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // =======================
    // Delete Product Functionality
    // =======================
    const deleteButtons = document.querySelectorAll('.delete-product-btn');
    const deleteModalElement = document.getElementById('deleteModal');
    let deleteModal = null;
    let productIdToDelete = null;

    if (deleteModalElement) {
        deleteModal = new bootstrap.Modal(deleteModalElement);
    }

    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (!deleteModal) return;
            productIdToDelete = this.getAttribute('data-id');
            const productName = this.getAttribute('data-name');
            const productNameElement = document.getElementById('productName');
            if (productNameElement) productNameElement.textContent = productName;
            deleteModal.show();
        });
    });

    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', async function() {
            if (!productIdToDelete) return;

            const btn = this;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Deleting...';
            btn.disabled = true;

            try {
                const response = await fetch(`/admin/products/${productIdToDelete}/delete`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                const data = await response.json();

                if (data.success) {
                    deleteModal.hide();
                    showAlert('success', 'Product deleted successfully!');

                    // Remove the row safely
                    const row = document.querySelector(`.delete-product-btn[data-id="${productIdToDelete}"]`).closest('tr');
                    if (row) {
                        row.style.transition = 'opacity 0.3s';
                        row.style.opacity = '0';
                        setTimeout(() => row.remove(), 300);
                    }

                    productIdToDelete = null;
                    btn.innerHTML = originalText;
                    btn.disabled = false;

                    // Reload page if no products left
                    if (document.querySelectorAll('tbody tr').length === 0) {
                        setTimeout(() => window.location.reload(), 500);
                    }
                } else {
                    showAlert('danger', data.message || 'Failed to delete product.');
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }
            } catch (error) {
                console.error(error);
                showAlert('danger', 'An error occurred while deleting the product.');
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    // =======================
    // Show Alert Function
    // =======================
    function showAlert(type, message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-2`;
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        const container = document.querySelector('.admin-content');
        container.insertBefore(alertDiv, container.firstChild);

        setTimeout(() => alertDiv.remove(), 5000);
    }

    // =======================
    // Image Preview on Form
    // =======================
    const imageInput = document.getElementById('image');
    if (imageInput) {
        imageInput.addEventListener('input', function() {
            let preview = document.querySelector('.image-preview');
            if (!preview && this.value) {
                const imageField = this.closest('.col-md-6');
                if (imageField) {
                    const previewContainer = document.createElement('div');
                    previewContainer.className = 'col-md-12 mt-3';
                    previewContainer.innerHTML = '<label class="form-label">Image Preview</label><div class="image-preview"></div>';
                    imageField.parentNode.insertBefore(previewContainer, imageField.nextSibling);
                    preview = previewContainer.querySelector('.image-preview');
                }
            }

            if (preview && this.value) {
                let img = preview.querySelector('img');
                if (!img) {
                    img = document.createElement('img');
                    img.className = 'img-thumbnail';
                    img.style.maxWidth = '300px';
                    preview.appendChild(img);
                }
                img.src = this.value;
                img.onerror = function() { this.src = '/images/placeholder.jpg'; };
            }
        });
    }

    // =======================
    // Product Form Validation
    // =======================
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            const price = parseFloat(document.getElementById('price').value);
            const stock = parseInt(document.getElementById('stock').value);
            const rating = parseFloat(document.getElementById('rating').value);

            if (price < 0) { e.preventDefault();
                showAlert('danger', 'Price cannot be negative.'); return false; }
            if (stock < 0) { e.preventDefault();
                showAlert('danger', 'Stock cannot be negative.'); return false; }
            if (rating < 0 || rating > 5) { e.preventDefault();
                showAlert('danger', 'Rating must be between 0 and 5.'); return false; }
        });
    }
});