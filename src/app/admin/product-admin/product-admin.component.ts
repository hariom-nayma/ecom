import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductService } from '../../products/product.service';
import { AdminService } from '../admin.service';
import { Product } from '../../shared/models/product.model';
import { ProductCategory } from '../../shared/models/category.model';

@Component({
  selector: 'app-product-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatPaginatorModule,
    MatSortModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './product-admin.component.html',
  styleUrls: ['./product-admin.component.css']
})
export class ProductAdminComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'brand', 'price', 'discountPercent', 'stock', 'ratings', 'categoryName', 'actions'];
  dataSource: MatTableDataSource<Product> = new MatTableDataSource();
  categories: ProductCategory[] = [];
  productForm: FormGroup;
  isEditMode = false;
  selectedProductId: number | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private productService: ProductService,
    private adminService: AdminService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      discountPercent: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      categoryName: ['', Validators.required],
      brand: ['', Validators.required],
      ratings: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
      imageUrl: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadProducts(): void {
    this.productService.getAllProducts(0,100).subscribe(page => {
      this.dataSource.data = page.content;
    });
  }

  loadCategories(): void {
    this.adminService.getAllCategories().subscribe((categories: ProductCategory[]) => {
      this.categories = categories;
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const operation = this.isEditMode
        ? this.productService.updateProduct(this.selectedProductId!, this.productForm.value)
        : this.productService.createProduct(this.productForm.value);

      operation.subscribe(() => {
        const message = this.isEditMode ? 'Product updated successfully' : 'Product created successfully';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.resetForm();
        this.loadProducts();
      });
    }
  }

  editProduct(product: Product): void {
    this.isEditMode = true;
    this.selectedProductId = product.id;
    this.productForm.patchValue(product);
  }

  deleteProduct(id: number): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
        this.loadProducts();
      });
    }
  }

  resetForm(): void {
    this.isEditMode = false;
    this.selectedProductId = null;
    this.productForm.reset();
  }
}

