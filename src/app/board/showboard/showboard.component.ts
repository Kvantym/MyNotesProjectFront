import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import * as BoardActions from '../../board/boardNgRx/board.actions';
import {
  selectBoard,
  selectBoardLoading,
  selectCarts,
  selectLists,
} from '../../board/boardNgRx/board.selectors';

import { AuthService } from '../../services/auth.service';

import { CreateCartListComponent } from '../../cartList/createCartList/createcartlist.component';
import { CreateCartComponent } from '../../cart/createCart/createcart.component';
import { ShowCartComponent } from '../../cart/showCart/showcart.component';
import { ShowCartListComponent } from '../../cartList/showcartlist/showcartlist.component';

interface ListCart {
  id: string;
  name: string;
  boardId: string;
  carts: any[];
}

@Component({
  selector: 'app-board',
  templateUrl: './showboard.component.html',
  styleUrls: ['./showboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CreateCartListComponent,
    CreateCartComponent,
    ShowCartComponent,
    ShowCartListComponent,
  ],
})
export class ShowBoardComponent implements OnInit {
  boardId!: string;
  cartListId!: string;

  board$!: Observable<any>;
  loading$!: Observable<boolean>;
  lists$!: Observable<ListCart[]>;
  carts$!: Observable<any[]>;

  showCartId!: string;
  showCartListId!: string;

  isCreateCartListOpen = false;
  isCreateCartOpen = false;
  showCartModalOpen = false;
  showCartListModalOpen = false;

  selectedCartListIds: { [cartId: string]: string } = {};
  currentUserId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private store: Store,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.boardId = this.route.snapshot.paramMap.get('id') ?? '';

    const user = this.authService.getCurrentUserLocal();
    if (!user) {
      console.error('Користувач не авторизований!');
      return;
    }

    this.currentUserId = user.id;

    this.board$ = this.store.select(selectBoard);
    this.loading$ = this.store.select(selectBoardLoading);
    this.lists$ = this.store.select(selectLists);
    this.carts$ = this.store.select(selectCarts);

    if (this.boardId) {
      this.storeLoad();
    }

    this.authService.currentUser$.subscribe((user) => {
      if (user?.id && user.id !== this.currentUserId) {
        this.currentUserId = user.id;
        if (this.boardId) {
          this.storeLoad();
        }
      }
    });
  }

  addList(): void {
    this.isCreateCartListOpen = true;
  }

  closeCreateCartListModal(): void {
    this.isCreateCartListOpen = false;
    this.storeLoad();
  }

  addCard(listId: string): void {
    this.cartListId = listId;
    this.isCreateCartOpen = true;
  }

  closeCreateCartModal(): void {
    this.isCreateCartOpen = false;
    this.storeLoad();
  }

  public storeLoad(): void {
    this.store.dispatch(BoardActions.loadBoard({ boardId: this.boardId }));
    this.store.dispatch(BoardActions.loadLists({ boardId: this.boardId }));
  }

  moveCartToCartList(cartId: string): void {
    const cartListId = this.selectedCartListIds[cartId];
    if (!cartListId) {
      console.warn('Не вибрано новий список для картки', cartId);
      return;
    }

    this.store.dispatch(BoardActions.moveCart({ cartId, cartListId }));
  }

  openShowCarForm(cartId: string): void {
    this.showCartId = cartId;
    this.showCartModalOpen = true;
  }

  closeShowCartModal(): void {
    this.showCartId = '';
    this.showCartModalOpen = false;
    this.storeLoad();
  }

  openShowListCarForm(cartListId: string): void {
    this.showCartListId = cartListId;
    this.showCartListModalOpen = true;
  }

  closeShowListCartModal(): void {
    this.showCartListId = '';
    this.showCartListModalOpen = false;
    this.storeLoad();
  }


}
