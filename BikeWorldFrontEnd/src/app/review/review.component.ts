import { Component, Input, Output } from '@angular/core';


@Component({
  selector: 'review-block',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.css']
})
export class ReviewComponent{
  @Input() reviewModel?: Review;  
  
  constructor() {  }
}

class Review {
  id?: string;
  title?: string;
  text?: string;
  stars?: number;
  author?: string;
}