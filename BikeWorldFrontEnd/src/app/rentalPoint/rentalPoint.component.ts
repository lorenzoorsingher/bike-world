import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http' 
import { lastValueFrom, map } from 'rxjs';

@Component({
  selector: 'rentalPoint-root',
  templateUrl: './rentalPoint.component.html',
  providers: []
})
export class RentalPointComponent {

  constructor(private router: Router, private _ActivatedRoute: ActivatedRoute, private http: HttpClient) {
    
  }

  ngOnInit(): void {
  }

}
