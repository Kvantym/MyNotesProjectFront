import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Додано для *ngIf, *ngFor
import { FormsModule } from '@angular/forms';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-chat',
  standalone: true, // Переконайся, що цей рядок є
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  imports: [
    CommonModule, // Додано: тепер *ngIf та *ngFor працюватимуть
    FormsModule   // Для [(ngModel)]
  ]
})
export class ChatComponent {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  messages: { role: 'user' | 'ai', text: string }[] = [];
  userInput: string = '';
  isOpen: boolean = false;
  isLoading: boolean = false;

  constructor(private chatService: ChatService) {}

  toggleChat() {
    this.isOpen = !this.isOpen;
    console.log('Стан чату (isOpen):', this.isOpen); // Для дебагу
    if (this.isOpen) {
      this.scrollToBottom();
    }
  }

  sendMessage() {
    const text = this.userInput.trim();
    if (!text || this.isLoading) return;

    this.messages.push({ role: 'user', text });
    this.userInput = '';
    this.isLoading = true;
    this.scrollToBottom();

    this.chatService.askGemini(text).subscribe({
      next: (res) => {
        this.messages.push({ role: 'ai', text: res.text });
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (err) => {
        console.error('AI Error:', err);
        this.messages.push({ role: 'ai', text: 'Вибач, сталася помилка. Перевір бекенд.' });
        this.isLoading = false;
        this.scrollToBottom();
      }
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        if (this.scrollContainer) {
          this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        }
      } catch (err) {}
    }, 100);
  }
}
