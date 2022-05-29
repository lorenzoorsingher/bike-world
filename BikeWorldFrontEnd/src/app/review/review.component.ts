import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { Component, Input, Output } from '@angular/core';
import { catchError, lastValueFrom, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'review-block',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent{
  @Input() reviewModel: Review = new Review();  
  @Input() itineraryId: string = "";

  updateFormVisible = false;
  inputReviewStars: number = 0;

  updateError: string = "";
  removeError: string = "";
  
  isDeleted: boolean = false;

  constructor(private http: HttpClient) {  }

  /**
   * Check if user is logged and he's editing his own reviews
   * @returns true if visile
   */
  btnUpdateVisible = () =>  sessionStorage.getItem("token") != null && sessionStorage.getItem("username") == this.reviewModel?.author;

  /**
   * Check if user is logged and he's removing his own reviews (or all if admin)
   * @returns true if visile
   */
  btnRemoveVisible = () => sessionStorage.getItem("token") != null && (sessionStorage.getItem("permissions") == "true" || sessionStorage.getItem("username") == this.reviewModel?.author);

  /**
   * Update Review
   * @param title new title
   * @param text new text
   * @param event event raised
   */
  async updateReview(title:string, text: string, event:any){
    event.preventDefault();

    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8').set('x-access-token', sessionStorage.getItem('token') ?? "");    
    const reqBody = {
      title: title,
      text: text,
      stars: this.inputReviewStars
    };
    
    await lastValueFrom(this.http.put<any>(`${environment.apiUrl}/api/v2/itineraries/${this.itineraryId}/reviews/${this.reviewModel._id}`, reqBody, {headers: headers}).pipe(map(data => {
      this.reviewModel.title = title;
      this.reviewModel.stars = this.inputReviewStars;
      this.reviewModel.text = text;

      this.inputReviewStars = 0;
      this.updateFormVisible = false;
      this.updateError = "";
    }), catchError(error => {
      this.updateError = error.error.message;
      return of([]);
    })));
  }

  /**
   * Remove review
   */
  async removeReview(){
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8').set('x-access-token', sessionStorage.getItem('token') ?? "");    
    await lastValueFrom(this.http.delete<any>(`${environment.apiUrl}/api/v2/itineraries/${this.itineraryId}/reviews/${this.reviewModel._id}`, {headers: headers}).pipe(map(data => {
      this.isDeleted = true;
      this.removeError = "";
    }), catchError(error => {
      this.removeError = error.error.message;
      return of([]);
    })));
  }
}

class Review {
  _id?: string;
  title?: string;
  text?: string;
  stars: number = 0;
  author?: string;
}