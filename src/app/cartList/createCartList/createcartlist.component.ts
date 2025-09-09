import { Component, EventEmitter, Output , Input} from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { ListCartService } from "../../services/list-cart.service";
import { NgZone } from "@angular/core";

@Component({
  selector: 'app-cartList-createCartList',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './createcartlist.component.html',
  styleUrls: ['./createcartlist.component.scss']
})
export class CreateCartListComponent {
  createCartListForm: FormGroup;
  errorMessage: string | null = null;

 @Input() boardId!: string;
  @Output() closeModal = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private listCartService: ListCartService,
    private ngZone: NgZone
  ) {
  this.createCartListForm = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(1)]]
});

  }

  onSubmit() {
    if (!this.createCartListForm.valid) return;

    const { name } = this.createCartListForm.value;
    this.listCartService.createCartList(this.boardId,{ name }).subscribe({
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
    window.location.reload();
  }
}
