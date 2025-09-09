import { Component, EventEmitter, Output, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { BoardService } from "../../services/board.service";
import { NgZone } from "@angular/core";

@Component({
  selector: 'app-board-updateboard',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './updateboard.component.html',
  styleUrls: ['./updateboard.component.scss']
})
export class UpdateBoardComponent {
  @Input() board: any;
  @Output() closeModal = new EventEmitter<void>();

  updateBoardForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private boardService: BoardService,
    private ngZone: NgZone
  ) {
    this.updateBoardForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnChanges() {
    if (this.board) {
      this.updateBoardForm.patchValue({
        name: this.board.name
      });
    }
  }

  onSubmit() {
  if (!this.updateBoardForm.valid || !this.board) return;

  const { name } = this.updateBoardForm.value;
  this.boardService.updateBoard(this.board.id, { name }).subscribe({
    next: () => this.ngZone.run(() => this.onCancel()),
    error: (err) => {
      console.error(err);
      this.errorMessage = 'Не вдалося оновити дошку. Спробуйте ще раз.';
    }
  });
}

  onCancel() {
    this.closeModal.emit();
    window.location.reload();
  }
}
