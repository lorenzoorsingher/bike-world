import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { catchError, lastValueFrom, map, Observable, of } from 'rxjs';
import { AgmMap, MapsAPILoader } from '@agm/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ConditionalExpr } from '@angular/compiler';


@Component({
  selector: 'report-damage-root',
  templateUrl: './reportDamage.component.html',
  styleUrls: ['./reportDamage.component.css']
})
export class ReportDamageComponent {
  title = 'My first AGM project';


  constructor(private http: HttpClient, private apiloader: MapsAPILoader, private router: Router) {
    console.log("damage")
  }

}
