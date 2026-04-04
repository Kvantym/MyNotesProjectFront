import { Component, OnInit } from '@angular/core';
import { ListCart, ListCartService } from '../../services/list-cart.service';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe, DatePipe, NgForOf, NgIf, SlicePipe, CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {ShowBoardComponent} from '../../board/showboard/showboard.component';
import {Observable} from 'rxjs';
import {ShowCartListComponent} from '../showcartlist/showcartlist.component';
import {ShowCartComponent} from '../../cart/showCart/showcart.component';

@Component({
  selector: 'app-cart-list-archive',
  standalone: true, // Переконайся, що компонент standalone
  imports: [
    CommonModule, // Рекомендую замість окремих NgIf/NgFor
    AsyncPipe,
    DatePipe,
    ReactiveFormsModule,
    FormsModule, // Потрібен для [(ngModel)] у шаблоні
    SlicePipe,
    ShowBoardComponent,
    ShowCartListComponent,
    ShowCartComponent,
  ],
  templateUrl: './cart-list-archive.html',
  styleUrl: './cart-list-archive.scss',

})
export class CartListArchive implements OnInit {
  listCarts: ListCart[] = [];
  boardId: string = '';

  // Властивості для сумісності з шаблоном (TS2339)
  lists$!: Observable<any[]>;
  selectedCartListIds: { [cartId: string]: string } = {};

  // Стан для модалок
  showCartId: string = '';
  showCartListId: string = '';
  showCartModalOpen = false;
  showCartListModalOpen = false;

  constructor(
    private listCartService: ListCartService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // 1. Отримуємо ID прямо з параметрів маршруту (URL)
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.boardId = idParam;
      console.log('Board ID loaded from URL:', this.boardId);
      this.getArcivedCartList(this.boardId);
      console.log(this.listCarts);
    } else {
      console.warn('Board ID not found in URL. Check your router configuration.');
    }
  }

  getArcivedCartList(boardId: string): void {
    this.listCartService.getArchiveListCart(boardId).subscribe({
      next: (data: ListCart[]) => {
        this.listCarts = data;
        console.log('Archived Lists:', this.listCarts);
      },
      error: (error) => {
        console.error('Error fetching archive:', error);
      }
    });
  }
  openShowCarForm(cartId: string): void {
    this.showCartId = cartId;
    this.showCartModalOpen = true;
  }

  openShowListCarForm(cartListId: string): void {
    this.showCartListId = cartListId;
    this.showCartListModalOpen = true;
  }

  removeListCartFromArchive(listCartId: string): void {
    if(confirm('Are you sure you want  unarchive this list cart?')) {
      this.listCartService.removeListCartFromArchive(listCartId).subscribe({
        next: () => {
          console.log('Remove listCartFromArchive');
          this.getArcivedCartList(this.boardId);
        },
        error: (error) => {
          console.error('Error remove listCartFromArchive');
        }
      });
    }
  }
  closeShowListCartModal(): void {
    this.showCartListId = '';
    this.showCartListModalOpen = false;
  }

  closeShowCartModal(): void {
    this.showCartId = '';
    this.showCartModalOpen = false;

  }




}
