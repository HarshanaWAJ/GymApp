import React, { useEffect, useState } from 'react';
import { Typography, IconButton, Tooltip, Button } from '@mui/material';
import StoreAdminSidebar from '../components/StoreAdminSidebar';
import axiosInstance from '../api/axiosInstance';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import AddProductModal from './forms/AddProductModal';
import UpdateProductModal from './forms/UpdateProductModal';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';

function ProductManagement() {
  const sidebarWidth = 200;
  const dashboardContentStyle = {
    padding: '20px',
    marginLeft: window.innerWidth >= 768 ? `${sidebarWidth}px` : '0',
    transition: 'margin-left 0.3s',
    overflowX: 'auto',
  };

  const [products, setProducts] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [productToUpdate, setProductToUpdate] = useState(null);

  // Fetch all products
  const fetchAllProducts = async () => {
    try {
      const response = await axiosInstance.get('/products/');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching product details:', error);
      toast.error('Failed to fetch products.');
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete(`/products/delete/${id}`);
        setProducts((prev) => prev.filter((product) => product._id !== id));
        Swal.fire('Deleted!', 'Product has been deleted.', 'success');
      } catch (error) {
        console.error('Error deleting product:', error);
        Swal.fire('Error', 'Failed to delete product.', 'error');
      }
    }
  };

  const handleEdit = (product) => {
    setProductToUpdate(product);
    setOpenUpdateModal(true);
  };

  const handleOpenAddModal = () => setOpenAddModal(true);
  const handleCloseAddModal = () => setOpenAddModal(false);

  const handleProductAdded = (newProduct) => {
    setProducts((prev) => [...prev, newProduct]);
    fetchAllProducts();
  };

  const handleProductUpdated = (updatedProduct, success) => {
    setOpenUpdateModal(false);
    setProductToUpdate(null);

    if (success) {
      toast.success('Product updated successfully!');
      fetchAllProducts();
    }
  };

  const handleCloseUpdateModal = () => {
    setOpenUpdateModal(false);
    setProductToUpdate(null);
  };

  const hasLowStock = products.some((product) => product.qty < product.restock_level);

  return (
    <div className="bootstrap-scope">
      <StoreAdminSidebar />
      <div style={dashboardContentStyle}>
        <Typography variant="h5" gutterBottom>
          Product Management
        </Typography>

        {/* Warning message for low stock */}
        {hasLowStock && (
          <div className="alert alert-warning" role="alert">
            ⚠️ Some products are below their restock levels!
          </div>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleOpenAddModal}
          sx={{ mb: 2 }}
        >
          Add Product
        </Button>

        <div className="table-responsive">
          <table className="table table-striped table-bordered table-hover mt-3">
            <thead className="thead-dark">
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price ($)</th>
                <th>Description</th>
                <th>Category</th>
                <th>Quantity</th>
                <th>Restock Level</th>
                <th>Expiry Date</th>
                <th>Purchase Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product) => {
                  const isLowStock = product.qty < product.restock_level;

                  return (
                    <tr key={product._id} className={isLowStock ? 'table-danger' : ''}>
                      <td>
                        {product.img_src ? (
                          <img
                            src={product.img_src}
                            alt={product.name}
                            width="80"
                            height="100"
                          />
                        ) : (
                          'No Image'
                        )}
                      </td>
                      <td>{product.name}</td>
                      <td>{product.price != null ? product.price.toFixed(2) : 'N/A'}</td>
                      <td>{product.description}</td>
                      <td>{product.category}</td>
                      <td>{product.qty}</td>
                      <td>{product.restock_level ?? 'N/A'}</td>
                      <td>
                        {product.expiry_date
                          ? new Date(product.expiry_date).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td>
                        {product.date_of_purchase
                          ? new Date(product.date_of_purchase).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td>
                        <Tooltip title="Edit">
                          <IconButton color="primary" onClick={() => handleEdit(product)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton color="error" onClick={() => handleDelete(product._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="text-center">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Product Modal */}
        <AddProductModal
          open={openAddModal}
          onClose={handleCloseAddModal}
          onProductAdded={handleProductAdded}
        />

        {/* Update Product Modal */}
        {productToUpdate && (
          <UpdateProductModal
            open={openUpdateModal}
            onClose={handleCloseUpdateModal}
            product={productToUpdate}
            onProductUpdated={handleProductUpdated}
          />
        )}

        {/* Toast Container */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
}

export default ProductManagement;
