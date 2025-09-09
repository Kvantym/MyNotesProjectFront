import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { CartService } from "../../services/cart.service";

@Component({
  selector: 'app-cart-updateCart',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './updatecart.component.html',
  styleUrls: ['./updatecart.component.scss']
})
export class UpdateCartComponent implements OnChanges {
  @Input() cart: any; // картка, що редагується
  @Output() closeModal = new EventEmitter<void>(); // подія закриття модалки
  @Output() cartUpdated = new EventEmitter<void>(); // подія оновлення

  updateCartForm: FormGroup;
  errorMessage: string | null = null;

  priorityOptions = ['Low', 'Medium', 'High'];
  statusOptions = ['Draft', 'Published', 'Deleted'];

  constructor(private fb: FormBuilder, private cartService: CartService) {
    this.updateCartForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      dueDate: [''],
      listCartId: ['', Validators.required],
      priorityNote: ['Low', Validators.required],
      statusNote: ['Draft', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cart'] && this.cart) {
      this.updateCartForm.patchValue({
        name: this.cart.name ?? '',
        description: this.cart.description ?? '',
        dueDate: this.cart.dueDate ? this.cart.dueDate.substring(0, 16) : '',
        listCartId: this.cart.listCartId ?? '',
        priorityNote: this.cart.priorityNote ?? 'Low',
        statusNote: this.cart.statusNote ?? 'Draft'
      });
    }
  }

  confirmDate(value: string) {
    if (value) {
      this.updateCartForm.patchValue({
        dueDate: value
      });
    }
  }

  onSubmit() {
    if (!this.updateCartForm.valid || !this.cart) return;

    const updatedCart = this.updateCartForm.value;

    this.cartService.updateCart(this.cart.id, updatedCart).subscribe({
      next: () => {
        this.cartUpdated.emit(); // кажемо батьку: "дані оновлені"
        this.onCancel(); // закриваємо модалку
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Не вдалося оновити картку. Спробуйте ще раз.';
      }
    });
  }

  onCancel() {
    this.closeModal.emit();
  }
}
