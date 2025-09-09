import { Component, EventEmitter, Output, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ListCartService } from "../../services/list-cart.service";
import { NgZone } from "@angular/core";

@Component({
  selector: 'app-cartList-updateCartList',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './updatecartlist.component.html',
  styleUrls: ['./updatecartlist.component.scss']
})
export class UpdateCartListComponent {
  @Input() cartList: any;
  @Output() closeModal = new EventEmitter<void>();

  updateCartListForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private cartListService: ListCartService,
    private ngZone: NgZone
  ) {
    this.updateCartListForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnChanges() {
    if (this.cartList) {
      this.updateCartListForm.patchValue({
        name: this.cartList.name
      });
    }
  }

  onSubmit() {
  if (!this.updateCartListForm.valid || !this.cartList) return;

  const { name } = this.updateCartListForm.value;
  this.cartListService.updateCartList(this.cartList.id, { name }).subscribe({
    next: () => this.ngZone.run(() => this.onCancel()),
    error: (err) => {
      console.error(err);
      this.errorMessage = 'Не вдалося оновити лист. Спробуйте ще раз.';
    }
  });
}

  onCancel() {
    this.closeModal.emit();

  }
}
