import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { FormsModule } from '@angular/forms';
import { NgZone } from '@angular/core';

import { BoardService } from "../../services/board.service";
import { CartService } from "../../services/cart.service";
import { ListCartService } from "../../services/list-cart.service";

import { UpdateCartListComponent } from "../../cartList/updateCartList/updatecartlist.component";
import { UpdateCartComponent } from '../../cart/updateCart/updatecart.component';
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
  imports: [CommonModule, UpdateCartListComponent, UpdateCartComponent,CreateCartListComponent,CreateCartComponent,FormsModule,ShowCartComponent, ShowCartListComponent],
})
export class ShowBoardComponent implements OnInit {
  boardId!: string;
  board: any = null;
  lists: ListCart[] = [];
  cartListId! : string;

  selectedCartList: any = null;
  showUpdateCartListForm = false;

  selectedCart: any = null;
  isUpdateCartModalOpen = false;

  isCreateCartListOpen = false;
  isCreateCartOpen = false;

selectedCartListId: string = '';

showCartModalOpen = false;
showCartListModalOpen = false;
showCartId!: string;
showCartListId!: string;

  constructor(
    private route: ActivatedRoute,
    private boardService: BoardService,
    private listService: ListCartService,
    private cardService: CartService,
    private ngZone: NgZone,
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

  addList(): void {
    console.log('Clicked Add List', this.boardId);
    this.isCreateCartListOpen = true;
  }
  closeCreateCartListModal() {
  this.isCreateCartListOpen = false;
}

  addCard(listId: string): void {
    console.log('Clicked Add Card', listId);
    this.cartListId = listId;
    this.isCreateCartOpen = true;
  }
    closeCreateCartModal() {
  this.isCreateCartOpen = false;
}

  openUpdateCartListForm(cartList: any) {
    this.selectedCartList = cartList;
    this.showUpdateCartListForm = true;
  }

  openUpdateCarForm(cart: any) {
    console.log('cliced update cart', cart);
    this.selectedCart = cart;
    this.isUpdateCartModalOpen = true;
  }

  closeUpdateCartModal() {
    this.selectedCart = null;
    this.isUpdateCartModalOpen = false;
  }

  cancelEditCart() {
    this.selectedCart = null;
    this.showUpdateCartListForm = false;
  }



  deleteList(listId: string): void {
    if (!confirm('Ви впевнені, що хочете видалити список?')) return;

    this.listService.deleteCartList(listId).subscribe({
      next: () => this.loadLists(),
      error: err => console.error('Помилка при видаленні списку:', err)
    });
  }

  deleteCard(cartId: string): void {
    if (!confirm('Ви впевнені, що хочете видалити картку?')) return;

    this.cardService.deleteCart(cartId).subscribe({
      next: () => this.loadLists(),
      error: err => console.error('Помилка при видаленні картки:', err)
    });
  }

moveCartToCartList(cartListId: string, cardId: string){
  this.cardService.moveToCartList(cartListId, cardId).subscribe({
     next: () => this.loadLists(),
     error: err => console.error('Помилка при перенесенні картки:', err)
  });
}
  openShowCarForm(cartId: string) {
    console.log('cliced show cart bu id', cartId);
    this.showCartId = cartId;
    this.showCartModalOpen = true;
  }

  closeShowCartModal() {
    this.showCartId = '';
    this.showCartModalOpen = false;
  }

   openShowListCarForm(cartListId: string) {
    console.log('cliced show cartlist by id', cartListId);
    this.showCartListId = cartListId;
    this.showCartListModalOpen = true;
  }

  closeShowListCartModal() {
    this.showCartListId = '';
    this.showCartListModalOpen = false;
  }

}
