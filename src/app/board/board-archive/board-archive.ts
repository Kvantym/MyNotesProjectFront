import {Component, OnInit} from '@angular/core';
import {BoardService} from '../../services/board.service';
import {CommonModule} from '@angular/common';
import {ShowBoardInformationComponent} from '../showinformitionboard/showinformitionboard.component';
import {UpdateBoardComponent} from '../updateboard/updateboard.component';
import {Router} from '@angular/router';

@Component({
  selector: 'app-board-archive',
  imports: [CommonModule, ShowBoardInformationComponent, UpdateBoardComponent],
  templateUrl: './board-archive.html',
  styleUrl: './board-archive.scss'
})
export class BoardArchive implements OnInit {
  boards: any[] = [];

  // Змінні стану для модалок (копіпаст з Dashboard)
  showUpdateBoardForm = false;
  selectedBoard: any = null;
  showBoardInfoForm = false;
  selectedBoardId: string | null = null;

  constructor(
    public boardService: BoardService,
    private router: Router // Додай Router в constructor для методу openBoard
  ) {}

  ngOnInit() {
    this.getBoardIfIsArchived();

  }

  getBoardIfIsArchived() {
    this.boardService.getBoardIfIsArchived().subscribe({
      next: (data) => this.boards = data,
      error: (err) => console.error(err)
    });
  }

  // --- МЕТОДИ ДЛЯ КОПІПАСТУ (Адаптовані) ---

  openBoard(board: any) {
    if (board?.id) this.router.navigate(['/boards', board.id]);
  }

  openUpdateBoardForm(board: any) {
    this.selectedBoard = board;
    this.showUpdateBoardForm = true;
  }

  closeUpdateBoardForm() {
    this.showUpdateBoardForm = false;
    this.selectedBoard = null;
    this.getBoardIfIsArchived(); // Оновлюємо список після редагування
  }

  openShowBoardInformation(boardId: string) {
    this.selectedBoardId = boardId;
    this.showBoardInfoForm = true;
  }

  closeShowBoardInformation() {
    this.showBoardInfoForm = false;
    this.selectedBoardId = null;
    this.getBoardIfIsArchived(); // Оновлюємо список, щоб побачити зміни
  }

  // Цей метод викликається, коли в модалці щось змінили (наприклад, видалили колоборанта)
  onBoardUpdated() {
    this.getBoardIfIsArchived();
  }

  searchBoardByName(boardName: string, isArchive: boolean): void {
    this.boardService.searchBoardByName(boardName, isArchive).subscribe({
      next: (data) => this.boards = data,
      error: (err) => console.error(err)
    });
  }
}
