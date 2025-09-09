import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import{ environment } from "../../environments/environment";
import { isPlatformBrowser } from "@angular/common";

@Injectable({
  providedIn: "root",
})
export class BoardService {
  private apiUrl = `${environment.apiUrl}/board`;

  constructor(private http: HttpClient) {}

  createBoard(data: { name: string }) {
    return this.http.post(`${this.apiUrl}/create-board`, data);
  }

  updateBoard(boardId: string, data: any) {
    return this.http.put(`${this.apiUrl}/${boardId}`, data);
  }

  deleteBoard(boardId: string) {
    return this.http.delete(`${this.apiUrl}/${boardId}`);
  }

  getBoardById(boardId: string) {
    return this.http.get(`${this.apiUrl}/board-by-id/${boardId}`);
  }

  getBoardsByUser() {
    return this.http.get(`${this.apiUrl}/board-by-user`);
  }
}

