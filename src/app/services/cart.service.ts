import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface ActivityCartResponse {
  id: string;
  action: string;
  activityInformation: string;
  userId: string;
  activityTime: string;
  cartId: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;

  constructor(private http: HttpClient) {}

  createCart(listCartId: string, data: any) {
    return this.http.post(`${this.apiUrl}/create-cart/${listCartId}`, data);
  }

  updateCart(cartId: string, data: any) {
    return this.http.put(`${this.apiUrl}/${cartId}`, data);
  }

  deleteCart(cartId: string) {
    return this.http.delete(`${this.apiUrl}/${cartId}`);
  }

  getCartById(cartId: string) {
    return this.http.get(`${this.apiUrl}/${cartId}`);
  }

  getCartsByCartListId(listCartId: string) {
    return this.http.get<any[]>(
      `${this.apiUrl}/carts-by-list-cartId/${listCartId}`
    );
  }
  getCartsByUser() {
    return this.http.get(`${this.apiUrl}/carts-by-user`);
  }
  moveToCartList(cartListId: string, cardId: string) {
    const token = localStorage.getItem('authToken');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return this.http.put(
      `${this.apiUrl}/move-to-cart-list${cartListId}?cartId=${cardId}`,
      {},
      { headers }
    );
  }
  getActivityCart(cartId: string) {
    return this.http.get<ActivityCartResponse[]>(
      `${this.apiUrl}/get-activity-cart/${cartId}`
    );
  }

  getArchivedCart(cartListId: string) {
    return this.http.get<any[]>(`${this.apiUrl}/carts-by-list-cartId-isArchive/${cartListId}`)
  }

  addCartToArchive(cartId: string) {
   return  this.http.put(`${this.apiUrl}/add-cart-to-archive/${cartId}`,{})
  }
  removeCartFromArchive(cartId: string) {
    return  this.http.put(`${this.apiUrl}/remove-cart-from-archive/${cartId}`,{})
  }
}
