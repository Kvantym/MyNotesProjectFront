import { Component, EventEmitter, Output , Input} from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { CartService } from "../../services/cart.service";
import { NgZone } from "@angular/core";

@Component({
  selector: 'app-createCart-createCart',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './createcart.component.html',
  styleUrls: ['./createcart.component.scss']
})
export class CreateCartComponent {
  createCartForm: FormGroup;
  errorMessage: string | null = null;

 @Input() cartListId!: string;
@Output() closeModal = new EventEmitter<void>();
@Output() cartCreated = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private ngZone: NgZone
  ) {
  this.createCartForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
      dueDate: [''],
      priorityNote: ['Low'],
      statusNote: ['Draft']
    });

  }

  onSubmit() {
    if (!this.createCartForm.valid) return;

    const newcart = this.createCartForm.value;
    this.cartService.createCart(this.cartListId,newcart).subscribe({
      next: () => {
        this.ngZone.run(() => {
        this.onCancel();
        });

      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Не вдалося створити дошку. Спробуйте ще раз.';
      }
    });
  }

  onCancel() {
    this.closeModal.emit();
     this.cartCreated.emit();
  }
}
