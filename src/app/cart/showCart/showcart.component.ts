import {Component, EventEmitter, Output, Input, OnInit, ViewChild, ElementRef} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CartService, ActivityCartResponse } from '../../services/cart.service';
import { UpdateCartComponent } from '../updateCart/updatecart.component';
import {CommentResponse, CommentService} from '../../services/comment.services';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-cart-showCart',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, UpdateCartComponent, FormsModule],
  templateUrl: './showcart.component.html',
  styleUrls: ['./showcart.component.scss'],
})
export class ShowCartComponent implements OnInit {
  @Input() cartId!: string;
  @Input() currentUserId: string | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() cartUpdated = new EventEmitter<void>();
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  showCartForm: FormGroup;
  errorMessage: string | null = null;

  selectedCart: any = null;
  selectedCartData: any = null;
  isUpdateCartModalOpen = false;

  activities: ActivityCartResponse[] = [];
  displayedActivities: ActivityCartResponse[] = [];
  activitiesBatch = 10;
  currentIndex = 0;
  comments: CommentResponse[] = []; // Твій новий DTO
  newCommentText: string = '';

  constructor(private fb: FormBuilder, private cartService: CartService, private commentService: CommentService,) {
    this.showCartForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1)]],
      description: [''],
      dueDate: [''],
      priorityNote: ['Low'],
      statusNote: ['Draft'],
    });
  }

  ngOnInit() {
    if (this.cartId) {
      this.cartService.getCartById(this.cartId).subscribe({
        next: (data: any) => {
          this.showCartForm.patchValue(data);
          this.selectedCartData = { ...data, id: this.cartId };
          this.loadActivities();
          this.loadComments();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Failed to load the cart.';
        },
      });
    }
  }

  loadActivities() {
    this.cartService.getActivityCart(this.cartId).subscribe({
      next: (data) => {
        this.activities = data.sort(
          (a, b) =>
            new Date(b.activityTime).getTime() -
            new Date(a.activityTime).getTime()
        );
        this.displayedActivities = this.activities.slice(
          0,
          this.activitiesBatch
        );
        this.currentIndex = this.activitiesBatch;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load activity history.';
      },
    });
  }

  loadMoreActivities() {
    const nextIndex = this.currentIndex + this.activitiesBatch;
    this.displayedActivities = this.activities.slice(0, nextIndex);
    this.currentIndex = nextIndex;
  }

  reloadCart() {
    if (!this.cartId) return;

    this.cartService.getCartById(this.cartId).subscribe({
      next: (cartData) => {
        this.showCartForm.patchValue(cartData);
        this.selectedCartData = { ...cartData, id: this.cartId };
        this.loadActivities();
        this.cartUpdated.emit();
      },
      error: (err) => console.error('Error loading the cart:', err),
    });
  }

  deleteCard(cartId: string): void {
    if (!confirm('Are you sure you want to delete this cart?')) return;

    this.cartService.deleteCart(cartId).subscribe({
      next: () => {
        this.onCancel();
      },
      error: (err) => console.error('Error deleting the cart:', err),
    });
  }

  onCancel() {
    this.closeModal.emit();
    this.cartUpdated.emit();
  }

  openUpdateCarForm(cart: any) {
    console.log('clicked open cart', cart);
    this.selectedCart = cart;
    this.isUpdateCartModalOpen = true;
  }

  closeUpdateCartModal() {
    this.selectedCart = null;
    this.isUpdateCartModalOpen = false;
  }

  loadComments() {
    this.commentService.GetComments(this.cartId).subscribe({
      next: (data) => {
        this.comments = data.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()

        );
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (err) => console.error('Error loading comments:', err)
    });
  }

  addComment() {
    if(!this.newCommentText || this.newCommentText.trim() === ''){
      return;
    }
    this.commentService.AddComent(this.cartId, this.newCommentText).subscribe({
      next: () => {
        this.newCommentText='';
        this.loadComments();
      },
      error: (err) => {
        console.error('Error adding comment:', err);
        this.errorMessage = 'Could not add comment.';
      }
    });
  }
  private scrollToBottom(): void {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }

  public deleteComment(commentId: string) {
    if (!confirm('Ви впевнені, що хочете видалити цей коментар?')) {
      return;
    }
    this.commentService.DeleteComment(commentId).subscribe({
      next: () => {
        this.loadComments();
      },
      error: (err) => {
        console.error('Error deleting the comment:', err);
      }
    });
  }
}
