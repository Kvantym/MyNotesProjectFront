import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CreateBoardComponent } from '../board/createBoard/createboard.component';
import { BoardService } from '../services/board.service';
import { UpdateBoardComponent } from '../board/updateboard/updateboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CreateBoardComponent, UpdateBoardComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  userName: string | null = null;
  boards: any[] = [];
  showCreateBoardForm = false;
  showUpdateBoardForm = false;
  boardId!: string;
  selectedBoard: any = null;

  constructor(
    private router: Router,
    private boardService: BoardService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.userName = payload.unique_name || payload.email || 'користувач';
        } catch (e) {
          console.error('Помилка при розборі токена:', e);
          this.userName = 'користувач';
        }
      }
    }
  }

  ngOnInit() {
     if (isPlatformBrowser(this.platformId)) {
    this.loadBoards();
  }

  }

  loadBoards() {
    this.boardService.getBoardsByUser().subscribe({
      next: (response: any) => {
        this.boards = response;
        console.log('Дошки завантажено:', this.boards);
      },
      error: (err) => {
        console.error('Помилка при завантаженні дошок:', err);
      }
    });
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
    this.router.navigate(['/login']);
  }

  openCreateBoardForm() {
    this.showCreateBoardForm = true;
  }

  closeCreateBoardForm(refresh: boolean = false) {
    this.showCreateBoardForm = false;
    if (refresh) {
      this.loadBoards();
    }
  }
openBoard(board: any) {
  console.log(board);  // перевір що є в board
  if (board && board.id) {
    this.router.navigate(['/boards', board.id]);
  } else {
    console.error('board.id відсутній!', board);
  }
}

deleteBoard(boardId: string) {
  console.log('Deleting board with ID:', boardId);
  if (!boardId) {
    console.error('boardId відсутній!');
    return;
  }
  const confirmed = window.confirm('Ви впевнені, що хочете видалити цю дошку?');
  if (!confirmed) {
    return; // Користувач відмінив видалення
  }
  this.boardService.deleteBoard(boardId).subscribe({
    next: () => {
      console.log('Board deleted successfully');
      this.loadBoards();
    },
    error: (err) => {
      console.error('Помилка при видаленні дошки:', err);
    }
  });
}

 openUpdateBoardForm(board: any) {
  console.log('Clicked board:', board); // перевір що передається
  this.selectedBoard = board; // передаємо весь об'єкт, не тільки id
  this.showUpdateBoardForm = true;
}


  closeUpdateBoardForm(refresh: boolean = false) {
    this.showUpdateBoardForm = false;
    this.selectedBoard = null;
    if (refresh) {
      this.loadBoards();
    }
  }

}
