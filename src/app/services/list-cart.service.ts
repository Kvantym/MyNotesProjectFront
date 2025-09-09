import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { isPlatformBrowser } from "@angular/common";

interface ListCart {
  id: string;
  name: string;
  boardId: string;
  carts: any[];
  activityListCarts: any[];
}
export interface ActivityCartListResponse {
  action: string;
  activityInformation: string;
  activityTime: string;
}


@Injectable({
  providedIn: "root",
})
export class ListCartService {
  private apiUrl = `${environment.apiUrl}/list-cart`;

   constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}
  private getAuthHeaders(): { headers: HttpHeaders } {
  let headers = new HttpHeaders();
  if (isPlatformBrowser(this.platformId)) {
    const token = localStorage.getItem("authToken");
    if (token) {
      headers = headers.set("Authorization", `Bearer ${token}`);
    } else {
      console.warn('No token found in localStorage');
    }
  }
  return { headers };
}

  createCartList(boardId: string, data: { name: string }): Observable<ListCart> {
    return this.http.post<ListCart>(`${this.apiUrl}/create-list-cart/${boardId}`, data, this.getAuthHeaders());
  }

  updateCartList(listCartId: string, data: Partial<ListCart>): Observable<ListCart> {
    return this.http.put<ListCart>(`${this.apiUrl}/${listCartId}`, data, this.getAuthHeaders());
  }

  deleteCartList(listCartId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${listCartId}`, this.getAuthHeaders());
  }

  getListCartByBoardId(boardId: string): Observable<ListCart[]> {
    return this.http.get<ListCart[]>(`${this.apiUrl}/list-cart-by-boardid/${boardId}`, this.getAuthHeaders());
  }

  getListCartByUser(): Observable<ListCart[]> {
    return this.http.get<ListCart[]>(`${this.apiUrl}/list-cart-by-user`, this.getAuthHeaders());
  }

  moveToBoard(listCartId: string, boardId: string): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/move-to-board/${boardId}`, this.getAuthHeaders());
  }
}
