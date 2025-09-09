import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import{ environment } from "../../environments/environment";

export interface ActivityCartResponse {
  id: string;
  action: string; // відповідає UserAction
  activityInformation: string;
  userId: string;
  activityTime: string; // можна конвертувати у Date при використанні
  cartId: string;
}

@Injectable({
  providedIn: "root",
})
export class CartService   {
  private apiUrl = `${environment.apiUrl}/cart`;

  constructor(private http: HttpClient) { }

  createCart(listCartId: string, data: any ) {
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
 return this.http.get<any[]>(`https://localhost:7187/api/cart/carts-by-list-cartId/${listCartId}`);
}
 getCartsByUser() {
    return this.http.get(`${this.apiUrl}/carts-by-user`);
  }
moveToCartList(cartListId: string, cardId: string) {
  const token = localStorage.getItem('authToken'); // твій JWT
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  return this.http.put(
    `https://localhost:7187/api/cart/move-to-cart-list${cartListId}?cartId=${cardId}`,
    {},
    { headers }
  );
}
getActivityCart(cartId: string) {
    return this.http.get<ActivityCartResponse[]>(`${this.apiUrl}/get-activity-cart/${cartId}`);
  }
}
