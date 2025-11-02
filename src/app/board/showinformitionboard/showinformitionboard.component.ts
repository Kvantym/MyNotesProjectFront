import { Component, EventEmitter, Output, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { BoardService, ActivityBoardResponse } from "../../services/board.service";
import { NgZone } from "@angular/core";
import { UpdateBoardComponent } from "../updateboard/updateboard.component";
import { ChangeDetectorRef } from "@angular/core";
import { Store } from "@ngrx/store";
import * as BoardActions from "../boardNgRx/board.actions";



@Component({
  selector: 'app-board-showinformitionboard',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, UpdateBoardComponent],
  templateUrl: './showinformitionboard.component.html',
  styleUrls: ['./showinformitionboard.component.scss'],

})
export class ShowBoardInformationComponent implements OnInit {
  @Input() boardId!: string;
  @Output() closeModal = new EventEmitter<void>();
  @Output() boardUpdated = new EventEmitter<void>();


  showBoardForm: FormGroup;
  errorMessage: string | null = null;

  selectedBoard: any = null;
  isUpdateBoardModalOpen = false;
  selectedBoardData: any = null;

  activities: ActivityBoardResponse[] = [];
  displayedActivities: ActivityBoardResponse[] = [];
  activitiesBatch = 10;
  currentIndex = 0;

  constructor(
    private fb: FormBuilder,
    private boardService: BoardService,
    private ngZone: NgZone,
    private store: Store,
     private cd: ChangeDetectorRef,

  ) {
    this.showBoardForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
    });
  }



 ngOnInit() {
  if (this.boardId) {
    this.boardService.getBoardById(this.boardId).subscribe({
      next: (data) => {
        this.showBoardForm.patchValue(data);
        this.selectedBoardData = { ...data, id: this.boardId };

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
  this.boardService.getBoardActivityByBoardId(this.boardId).subscribe({
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

  private loadBoardData(boardId: string) {
    this.boardService.getBoardById(boardId).subscribe({
      next: (data) => {
        this.showBoardForm.patchValue(data);
        this.selectedBoardData = { ...data, id: boardId };

        // Завантаження активностей
        this.boardService.getBoardActivityByBoardId(boardId).subscribe({
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
 reloadBoard() {
  if (!this.boardId) return;

  this.boardService.getBoardById(this.boardId).subscribe({
    next: (boardData) => {
      this.showBoardForm.patchValue(boardData);
      this.selectedBoardData = { ...boardData, id: this.boardId };
      this.loadActivities();
    },
    error: (err) => console.error("Помилка при завантаженні списку:", err)
  });
}



  deleteBoard(boardId: string): void {
    if (!confirm('Ви впевнені, що хочете видалити картку?')) return;

    this.boardService.deleteBoard(this.boardId).subscribe({
      next: () => {this.onCancel()},
      error: err => console.error('Помилка при видаленні картки:', err)
    });
       this.store.dispatch(BoardActions.loadBoards());
  }

  onSubmit(boardId: string) {
    if (!this.showBoardForm.valid) return;

    const updatedBoard = this.showBoardForm.value;

    this.boardService.updateBoard(boardId, updatedBoard).subscribe({
      next: () => {
        console.log('Дошку оновлено успішно');

          this.loadBoardData(boardId);
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
    this.boardUpdated.emit();
  }

  openUpdateBoardForm(board: any) {
    console.log('clicked open board with id', board);
    this.selectedBoard = board;
    this.isUpdateBoardModalOpen = true;
  }

  closeUpdateBoardModal() {
    this.selectedBoard = null;
    this.isUpdateBoardModalOpen = false;
    //this.boardUpdated.emit();
  }
}
