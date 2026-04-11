import {Component, Inject, PLATFORM_ID, OnInit, ViewChild} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';

import { CreateBoardComponent } from '../board/createBoard/createboard.component';
import { UpdateBoardComponent } from '../board/updateboard/updateboard.component';
import { ShowBoardInformationComponent } from '../board/showinformitionboard/showinformitionboard.component';

import * as BoardSelectors from '../board/boardNgRx/board.selectors';
import * as BoardActions from '../board/boardNgRx/board.actions';
import {BoardService} from '../services/board.service';

import {Subscription, of } from 'rxjs';
import {ChatComponent} from '../ai/chat.component';

@Component({
  selector: 'app-dashboard',

  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CreateBoardComponent,
    UpdateBoardComponent,
    ShowBoardInformationComponent,
    ChatComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  @ViewChild('aiChat') aiChat!: ChatComponent;

  userName: string = 'User';
  boards$: Observable<any[]>;
  isCreateBoardOpen$: Observable<boolean>;

  showUpdateBoardForm = false;
  selectedBoard: any = null;
  showBoardInfoForm = false;
  selectedBoardId: string | null = null;

  isUserMenuOpen = false;
  userMenuTimeout: any;



  private searchSubscription?: Subscription;

  constructor(
    private router: Router,
    private store: Store,
    private boardService: BoardService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.boards$ = this.store.pipe(select(BoardSelectors.loadBoards));
    this.isCreateBoardOpen$ = this.store.pipe(
      select(BoardSelectors.selectIsCreateBoardOpen)
    );
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.store.dispatch(BoardActions.loadBoards());
      this.loadUserNameFromToken();
    }
  }

  private loadUserNameFromToken() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userName = payload.unique_name || payload.email || 'User';
    } catch (e) {
      console.error('Error parsing token:', e);
      this.userName = 'User';
    }
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    if (this.isUserMenuOpen) this.startUserMenuTimeout();
    else this.clearUserMenuTimeout();
  }

  startUserMenuTimeout() {
    this.clearUserMenuTimeout();
    this.userMenuTimeout = setTimeout(
      () => (this.isUserMenuOpen = false),
      5000
    );
  }

  clearUserMenuTimeout() {
    if (this.userMenuTimeout) {
      clearTimeout(this.userMenuTimeout);
      this.userMenuTimeout = null;
    }
  }

  onUserMenuMouseEnter() {
    this.clearUserMenuTimeout();
  }
  onUserMenuMouseLeave() {
    this.startUserMenuTimeout();
  }

  openProfile() {
    this.router.navigate(['/profil']);
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.clear();
    }
    this.router.navigate(['/login']);
  }

  openCreateBoardForm() {
    this.store.dispatch(BoardActions.openCreateBoardModal());
  }
  closeCreateBoardForm() {
    this.store.dispatch(BoardActions.closeCreateBoardModal());
  }
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
  }
  openShowBoardInformation(boardId: string) {
    this.selectedBoardId = boardId;
    this.showBoardInfoForm = true;
  }
  closeShowBoardInformation() {
    this.showBoardInfoForm = false;
    this.selectedBoardId = null;
    this.store.dispatch(BoardActions.loadBoards());
  }


  goToArchive(){
    this.router.navigate(['/archive']);
  }

  public searchBoard(boardName: string, isArchive: boolean): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    const query = boardName.trim();

    if (!query) {
      this.boards$ = this.store.pipe(select(BoardSelectors.loadBoards));
      return;
    }

    this.searchSubscription = this.boardService
      .searchBoardByName(query, isArchive)
      .subscribe({
        next: (results) => {
          this.boards$ = of(results);
        },
        error: (err) => {
          console.error('Search failed', err);
          this.boards$ = this.store.pipe(select(BoardSelectors.loadBoards));
        }
      });
  }
  openChat() {
    this.aiChat.toggleChat();
  }
}
