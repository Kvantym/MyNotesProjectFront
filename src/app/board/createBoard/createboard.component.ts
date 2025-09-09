import { Component, EventEmitter, Output } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { BoardService } from "../../services/board.service";
import { NgZone } from "@angular/core";

@Component({
  selector: 'app-board-createboard',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './createboard.component.html',
  styleUrls: ['./createboard.component.scss']
})
export class CreateBoardComponent {
  createBoardForm: FormGroup;
  errorMessage: string | null = null;
  boards: any[] = [];

  @Output() closeModal = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private boardService: BoardService,
    private ngZone: NgZone
  ) {
  this.createBoardForm = this.fb.group({
  name: ['', [Validators.required, Validators.minLength(1)]]
});

  }

  onSubmit() {
    if (!this.createBoardForm.valid) return;

    const { name } = this.createBoardForm.value;
    this.boardService.createBoard({ name }).subscribe({
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
