import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from "@angular/forms";

import { BoardService } from "../../services/board.service";
import { CartService } from "../../services/cart.service";
import { ListCartService } from "../../services/list-cart.service";

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
  selector: "app-board",
  templateUrl: "./showboard.component.html",
  styleUrls: ["./showboard.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CreateCartListComponent,
    CreateCartComponent,
    ShowCartComponent,
    ShowCartListComponent
  ],
})
export class ShowBoardComponent implements OnInit {
  boardId!: string;
  board: any = null;
  lists: ListCart[] = [];
  cartListId!: string;

  // модалки
  isCreateCartListOpen = false;
  isCreateCartOpen = false;
  showCartModalOpen = false;
  showCartListModalOpen = false;

  showCartId!: string;
  showCartListId!: string;

  constructor(
    private route: ActivatedRoute,
    private boardService: BoardService,
    private listService: ListCartService,
    private cardService: CartService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.boardId = this.route.snapshot.paramMap.get("id") ?? "";
    if (this.boardId) {
      this.loadBoard();
      this.loadLists();
    }
  }

  loadBoard(): void {
    this.boardService.getBoardById(this.boardId).subscribe({
      next: (boardData: any) => (this.board = boardData),
      error: (err: any) => console.error("Помилка завантаження дошки:", err),
    });
  }

  loadLists(): void {
    this.listService.getListCartByBoardId(this.boardId).subscribe({
      next: (lists: ListCart[]) => {
        this.lists = lists.map(list => ({ ...list, carts: [] }));
        this.lists.forEach(list => this.loadCards(list.id));
      },
      error: (err: any) => console.error('Помилка завантаження списків:', err)
    });
  }

  loadCards(listId: string): void {
    this.cardService.getCartsByCartListId(listId).subscribe({
      next: (cards: any[]) => {
        const list = this.lists.find(l => l.id === listId);
        if (list) list.carts = cards;
      },
      error: (err: any) => console.error('Помилка завантаження карток:', err)
    });
  }

  // створення списку
  addList(): void {
    this.isCreateCartListOpen = true;
  }
  closeCreateCartListModal() {
    this.isCreateCartListOpen = false;
  }

  // створення картки
  addCard(listId: string): void {
    this.cartListId = listId;
    this.isCreateCartOpen = true;
  }
  closeCreateCartModal() {
    this.isCreateCartOpen = false;
  }

  // перенесення картки між списками
  moveCartToCartList(cartListId: string, cardId: string) {
    this.cardService.moveToCartList(cartListId, cardId).subscribe({
      next: () => this.loadLists(),
      error: err => console.error('Помилка при перенесенні картки:', err)
    });
  }

  // показ картки
  openShowCarForm(cartId: string) {
    this.showCartId = cartId;
    this.showCartModalOpen = true;
  }
  closeShowCartModal() {
    this.showCartId = '';
    this.showCartModalOpen = false;
  }

  // показ списку
  openShowListCarForm(cartListId: string) {
    this.showCartListId = cartListId;
    this.showCartListModalOpen = true;
  }
  closeShowListCartModal() {
    this.showCartListId = '';
    this.showCartListModalOpen = false;
  }
}
