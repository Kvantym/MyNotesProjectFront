import { Component, EventEmitter, Output, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ListCartService, ActivityCartListResponse } from "../../services/list-cart.service";
import { NgZone } from "@angular/core";
import { UpdateCartListComponent } from "../updateCartList/updatecartlist.component";
import { ChangeDetectorRef } from "@angular/core";

@Component({
  selector: 'app-cartList-showcartlist',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, UpdateCartListComponent],
  templateUrl: './showcartlist.component.html',
  styleUrls: ['./showcartlist.component.scss']
})
export class ShowCartListComponent implements OnInit {
  @Input() cartListId!: string;
  @Output() closeModal = new EventEmitter<void>();

  showCartListForm: FormGroup;
  errorMessage: string | null = null;

  selectedCartList: any = null;
  isUpdateCartListModalOpen = false;
  selectedCartListData: any = null;

  activities: ActivityCartListResponse[] = [];
  displayedActivities: ActivityCartListResponse[] = [];
  activitiesBatch = 10;
  currentIndex = 0;

  constructor(
    private fb: FormBuilder,
    private listcartService: ListCartService,
    private ngZone: NgZone,
     private cd: ChangeDetectorRef,
  ) {
    this.showCartListForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
    });
  }
  @Output() cartUpdated = new EventEmitter<void>();



//трееба сьворить GetListCartById(guid ListCartId) в сервісі
//трееба сьворить GetActivityListCartById(guid ListCartId) в сервісі

 ngOnInit() {
  if (this.cartListId) {
    this.listcartService.getCartById(this.cartListId).subscribe({
      next: (data) => {
        this.showCartListForm.patchValue(data);
        this.selectedCartListData = { ...data, id: this.cartListId };

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
  this.listcartService.getActivityCart(this.cartListId).subscribe({
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
    this.listcartService.getCartById(cartId).subscribe({
      next: (data) => {
        this.showCartListForm.patchValue(data);
        this.selectedCartListData = { ...data, id: cartId };

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
  if (!this.cartListId) return;

  this.cartService.getCartById(this.cartListId).subscribe({
    next: (cartListData) => {
      this.showCartListForm.patchValue(cartListData);
      this.selectedCartListData = { ...cartListData, id: this.cartListId };
      this.loadActivities();
      this.cartUpdated.emit();
    },
    error: (err) => console.error("Помилка при завантаженні картки:", err)
  });
}



  deleteCard(cartId: string): void {
    if (!confirm('Ви впевнені, що хочете видалити картку?')) return;

    this.listcartService.deleteCartList(this.cartListId).subscribe({
      next: () => {this.onCancel()},
      error: err => console.error('Помилка при видаленні картки:', err)
    });
  }

  onSubmit(cartListId: string) {
    if (!this.showCartListForm.valid) return;

    const updatedCartList = this.showCartListForm.value;

    this.listcartService.updateCartList(cartListId, updatedCartList).subscribe({
      next: () => {
        console.log('Картку оновлено успішно');

          this.loadCartData(cartListId);
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

  openUpdateCarForm(cartlist: any) {
    console.log('clicked open cart', cartlist);
    this.selectedCartList = cartlist;
    this.isUpdateCartListModalOpen = true;
  }

  closeUpdateCartModal() {
    this.selectedCartList = null;
    this.isUpdateCartListModalOpen = false;
  }
}
