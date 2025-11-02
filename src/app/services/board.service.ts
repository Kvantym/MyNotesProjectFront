import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import{ environment } from "../../environments/environment";
import { isPlatformBrowser } from "@angular/common";
import { AuthService } from "./auth.service";
import { ListCartService } from "./list-cart.service";

export interface ActivityBoardResponse {
  action: string;
  activityInformation: string;
  activityTime: string;
}

@Injectable({
  providedIn: "root",
})
export class BoardService {
  private apiUrl = `${environment.apiUrl}/board`;



  constructor(private http: HttpClient, private authService: AuthService ) {}

  createBoard(data: { name: string }) {
    return this.http.post(`${this.apiUrl}/create-board`, data, this.authService.getAuthHeaders());
  }

  updateBoard(boardId: string, data: any) {
    return this.http.put(`${this.apiUrl}/${boardId}`, data);
  }

  deleteBoard(boardId: string) {
    return this.http.delete(`${this.apiUrl}/${boardId}`);
  }

  getBoardById(boardId: string) {
    return this.http.get<any>(`${this.apiUrl}/board-by-id/${boardId}`);
  }

getBoardsByUser() {
  const token = localStorage.getItem('token');
  return this.http.get(`${this.apiUrl}/board-by-user`, {
    headers: { Authorization: `Bearer ${token}` }
  });
}

    getBoardActivityByBoardId(boardId: string){
  return this.http.get<ActivityBoardResponse[]>(`${this.apiUrl}/get-activity-board/${boardId}`);
    }
}

