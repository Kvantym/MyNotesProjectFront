import { Component, EventEmitter, Output, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { CartService, ActivityCartResponse } from "../../services/cart.service";
import { UpdateCartComponent } from "../updateCart/updatecart.component";

@Component({
  selector: 'app-cart-showCart',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, UpdateCartComponent],
  templateUrl: './showcart.component.html',
  styleUrls: ['./showcart.component.scss']
})
export class ShowCartComponent implements OnInit {
  @Input() cartId!: string;
  @Output() closeModal = new EventEmitter<void>();
  @Output() cartUpdated = new EventEmitter<void>();

  showCartForm: FormGroup;
  errorMessage: string | null = null;

  selectedCart: any = null;
  selectedCartData: any = null;
  isUpdateCartModalOpen = false;

  activities: ActivityCartResponse[] = [];
  displayedActivities: ActivityCartResponse[] = [];
  activitiesBatch = 10;
  currentIndex = 0;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
  ) {
    this.showCartForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
      dueDate: [''],
      priorityNote: ['Low'],
      statusNote: ['Draft']
    });
  }

  ngOnInit() {
    if (this.cartId) {
      this.cartService.getCartById(this.cartId).subscribe({
        next: (data: any) => {
          this.showCartForm.patchValue(data);
          this.selectedCartData = { ...data, id: this.cartId };
          this.loadActivities();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Не вдалося завантажити картку.';
        }
      });
    }
  }

  loadActivities() {
    this.cartService.getActivityCart(this.cartId).subscribe({
      next: (data) => {
        this.activities = data.sort(
          (a, b) => new Date(b.activityTime).getTime() - new Date(a.activityTime).getTime()
        );
        this.displayedActivities = this.activities.slice(0, this.activitiesBatch);
        this.currentIndex = this.activitiesBatch;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Не вдалося завантажити історію дій.';
      }
    });
  }

  loadMoreActivities() {
    const nextIndex = this.currentIndex + this.activitiesBatch;
    this.displayedActivities = this.activities.slice(0, nextIndex);
    this.currentIndex = nextIndex;
  }

  reloadCart() {
    if (!this.cartId) return;

    this.cartService.getCartById(this.cartId).subscribe({
      next: (cartData) => {
        this.showCartForm.patchValue(cartData);
        this.selectedCartData = { ...cartData, id: this.cartId };
        this.loadActivities();
        this.cartUpdated.emit();
      },
      error: (err) => console.error("Помилка при завантаженні картки:", err)
    });
  }

  deleteCard(cartId: string): void {
    if (!confirm('Ви впевнені, що хочете видалити картку?')) return;

    this.cartService.deleteCart(cartId).subscribe({
      next: () => { this.onCancel() },
      error: err => console.error('Помилка при видаленні картки:', err)
    });
  }

  onCancel() {
    this.closeModal.emit();
    this.cartUpdated.emit();
  }

  openUpdateCarForm(cart: any) {
    console.log('clicked open cart', cart);
    this.selectedCart = cart;
    this.isUpdateCartModalOpen = true;
  }

  closeUpdateCartModal() {
    this.selectedCart = null;
    this.isUpdateCartModalOpen = false;
  }
}
