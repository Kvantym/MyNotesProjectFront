import { Component, EventEmitter, Output, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { CartService, ActivityCartResponse } from "../../services/cart.service";
import { NgZone } from "@angular/core";
import { UpdateCartComponent } from "../updateCart/updatecart.component";
import { ChangeDetectorRef } from "@angular/core";

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

  showCartForm: FormGroup;
  errorMessage: string | null = null;

  selectedCart: any = null;
  isUpdateCartModalOpen = false;
  selectedCartData: any = null;

  activities: ActivityCartResponse[] = [];
  displayedActivities: ActivityCartResponse[] = [];
  activitiesBatch = 10;
  currentIndex = 0;

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private ngZone: NgZone,
     private cd: ChangeDetectorRef,
  ) {
    this.showCartForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
      dueDate: [''],
      priorityNote: ['Low'],
      statusNote: ['Draft']
    });
  }
  @Output() cartUpdated = new EventEmitter<void>();




 ngOnInit() {
  if (this.cartId) {
    this.cartService.getCartById(this.cartId).subscribe({
      next: (data) => {
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
      // Сортуємо від нових до старих
      this.activities = data.sort((a, b) => new Date(b.activityTime).getTime() - new Date(a.activityTime).getTime());

      // Показуємо перші 10
      this.displayedActivities = this.activities.slice(0, this.activitiesBatch);
      this.currentIndex = this.activitiesBatch;
    },
    error: (err) => {
      console.error(err);
      this.errorMessage = 'Не вдалося завантажити історію дій.';
    }
  });
}

// Підвантаження ще 10 активностей
loadMoreActivities() {
  const nextIndex = this.currentIndex + this.activitiesBatch;
  this.displayedActivities = this.activities.slice(0, nextIndex);
  this.currentIndex = nextIndex;
}

  private loadCartData(cartId: string) {
    this.cartService.getCartById(cartId).subscribe({
      next: (data) => {
        this.showCartForm.patchValue(data);
        this.selectedCartData = { ...data, id: cartId };

        // Завантаження активностей
        this.cartService.getActivityCart(cartId).subscribe({
          next: (activities) =>{
 this.activities = activities;
 this.ngZone.run(()=>{
  this.cd.markForCheck();
 })
          },
          error: (err) => {
            console.error(err);
            this.errorMessage = 'Не вдалося завантажити активності картки.';
          }
        });
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Не вдалося завантажити картку.';
      }
    });
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
      next: () => {this.onCancel()},
      error: err => console.error('Помилка при видаленні картки:', err)
    });
  }

  onSubmit(cartId: string) {
    if (!this.showCartForm.valid) return;

    const updatedCart = this.showCartForm.value;

    this.cartService.updateCart(cartId, updatedCart).subscribe({
      next: () => {
        console.log('Картку оновлено успішно');

          this.loadCartData(cartId);
          this.onCancel();

      },
      error: (err) => {
        console.error('Помилка при оновленні картки:', err);
        this.errorMessage = 'Не вдалося оновити картку. Спробуйте ще раз.';
      }
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
