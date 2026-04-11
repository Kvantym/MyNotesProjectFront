import { Component, OnInit } from '@angular/core';
import { ListCart, ListCartService } from '../../services/list-cart.service';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe, DatePipe, NgForOf, NgIf, SlicePipe, CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {ShowBoardComponent} from '../../board/showboard/showboard.component';
import {Observable} from 'rxjs';
import {ShowCartListComponent} from '../showcartlist/showcartlist.component';
import {ShowCartComponent} from '../../cart/showCart/showcart.component';
import {CartService} from '../../services/cart.service';

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


  searchCartsResults: { [listId: string]: any[] } = {};
  searchListCartsResults: { [listId: string]: any[] } = {};

  constructor(
    private listCartService: ListCartService,
    private route: ActivatedRoute,
    private cartService: CartService,
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

  filters: { [listId: string]: any } = {};

  searchCart(
    listCartId: string,
    isArchive: boolean,
    name?: string,
    priority?: any,
    status?: any,
    dueDate?: string | null,
    createdAt?: string | null // Новий параметр
  ): void {

    const parsedPriority = (priority === 'null' || priority === undefined) ? null : Number(priority);
    const parsedStatus = (status === 'null' || status === undefined) ? null : Number(status);

    // Оновлюємо об'єкт фільтрів
    this.filters[listCartId] = {
      name: name ?? this.filters[listCartId]?.name ?? '',
      priority: priority !== undefined ? parsedPriority : this.filters[listCartId]?.priority,
      status: status !== undefined ? parsedStatus : this.filters[listCartId]?.status,
      dueDate: dueDate !== undefined ? dueDate : this.filters[listCartId]?.dueDate,
      createdAt: createdAt !== undefined ? createdAt : this.filters[listCartId]?.createdAt // Зберігаємо нову дату
    };

    const f = this.filters[listCartId];

    // Перевірка активності фільтрів (додано f.createdAt)
    const hasActiveFilters = f.name.trim() !== '' || f.priority !== null || f.status !== null || f.dueDate || f.createdAt;

    if (!hasActiveFilters) {
      delete this.searchCartsResults[listCartId];
      return;
    }

    // Відправляємо на сервіс (переконайся, що в сервісі теж додано цей аргумент)
    this.cartService.searchCartWithFilter(
      f.name,
      listCartId,
      isArchive,
      f.priority ?? undefined,
      f.status ?? undefined,
      f.dueDate ?? undefined,
      f.createdAt ?? undefined // Передаємо на бекенд
    ).subscribe({
      next: (data) => {
        this.searchCartsResults = { ...this.searchCartsResults, [listCartId]: data };
      },
      error: (err) => console.error('Помилка фільтрації:', err)
    });
  }
  searchListCart(cartName: string, boardId: string, isArchive:boolean): void {
    const query = cartName.trim();

    if (!query) {
      delete this.searchListCartsResults[boardId];
      return;
    }

    this.listCartService.searchListCart(query, boardId, isArchive).subscribe({
      next: (data: any[]) => {
        console.log('Результати пошуку:', data);
        // 2. Зберігаємо результати у локальну змінну
        this.searchListCartsResults[boardId] = data;
      },
      error: (err) => {
        console.error('Помилка при пошуку карток:', err);
      }
    });
  }


}
