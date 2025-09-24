import { Component, EventEmitter, Output, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ListCartService, ActivityCartListResponse } from "../../services/list-cart.service";
import { UpdateCartListComponent } from "../updateCartList/updatecartlist.component";

@Component({
  selector: 'app-cartList-showcartlist',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, UpdateCartListComponent],
  templateUrl: './showcartlist.component.html',
  styleUrls: ['./showcartlist.component.scss'],
})
export class ShowCartListComponent implements OnInit {
  @Input() cartListId!: string;
  @Output() closeModal = new EventEmitter<void>();
  @Output() cartListUpdated = new EventEmitter<void>();

  showCartListForm: FormGroup;
  errorMessage: string | null = null;

  selectedCartList: any = null;
  selectedCartListData: any = null;
  isUpdateCartListModalOpen = false;

  activities: ActivityCartListResponse[] = [];
  displayedActivities: ActivityCartListResponse[] = [];
  activitiesBatch = 10;
  public currentIndex = 0; // зроблено public для шаблону

  constructor(
    private fb: FormBuilder,
    private listcartService: ListCartService
  ) {
    this.showCartListForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  ngOnInit() {
    if (this.cartListId) {
      this.loadCartList();
    }
  }

  // --- Завантаження картки та активностей ---
  loadCartList() {
    this.listcartService.getListCartById(this.cartListId).subscribe({
      next: (data) => {
        this.showCartListForm.patchValue(data);
        this.selectedCartListData = { ...data, id: this.cartListId };
        this.loadActivities();
      },
      error: () => {
        this.errorMessage = 'Не вдалося завантажити картку.';
      }
    });
  }

  loadActivities() {
    this.listcartService.getListCartActivityByListId(this.cartListId).subscribe({
      next: (data) => {
        this.activities = data.sort(
          (a, b) => new Date(b.activityTime).getTime() - new Date(a.activityTime).getTime()
        );
        this.displayedActivities = this.activities.slice(0, this.activitiesBatch);
        this.currentIndex = this.activitiesBatch;
      },
      error: () => {
        this.errorMessage = 'Не вдалося завантажити історію дій.';
      }
    });
  }

  loadMoreActivities() {
    const nextIndex = this.currentIndex + this.activitiesBatch;
    this.displayedActivities = this.activities.slice(0, nextIndex);
    this.currentIndex = nextIndex;
  }

  // --- Картка ---
  openUpdateListCartForm(cartlist: any) {
    this.selectedCartList = cartlist;
    this.isUpdateCartListModalOpen = true;
  }

  closeUpdateListCartModal() {
    this.selectedCartList = null;
    this.isUpdateCartListModalOpen = false;
    this.loadCartList();
    this.cartListUpdated.emit();
  }

  deleteListCard() {
    if (!confirm('Ви впевнені, що хочете видалити картку?')) return;

    this.listcartService.deleteCartList(this.cartListId).subscribe({
      next: () => this.cancel(),
      error: (err) => console.error('Помилка при видаленні картки:', err)
    });
  }

  onSubmit() {
    if (!this.showCartListForm.valid) return;

    const updatedCartList = this.showCartListForm.value;

    this.listcartService.updateCartList(this.cartListId, updatedCartList).subscribe({
      next: () => {
        this.loadCartList();
        this.cancel();
        this.cartListUpdated.emit();
      },
      error: () => {
        this.errorMessage = 'Не вдалося оновити картку. Спробуйте ще раз.';
      }
    });
  }

  cancel() {
    this.closeModal.emit();
    this.cartListUpdated.emit();
  }
}
