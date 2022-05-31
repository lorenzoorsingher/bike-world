import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { catchError, lastValueFrom, map, Observable, of } from 'rxjs';
import { AgmMap, MapsAPILoader } from '@agm/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ConditionalExpr } from '@angular/compiler';
import { BrowserModule } from '@angular/platform-browser'

@Component({
  selector: 'report-damage-root',
  templateUrl: './reportDamage.component.html',
  styleUrls: ['./reportDamage.component.css']
})
export class ReportDamageComponent {
  title = 'My first AGM project';
  bikes: Bike[] | undefined;
  selectedBikeId: string = "";
  rentalName: string[] | undefined;
  description = ''

  reports: Report[] | undefined;
  selectedReportId: string = "";
  selectedReport: Report = new Report("", "", "");
  constructor(private http: HttpClient, private apiloader: MapsAPILoader, private router: Router) {
    console.log("damage")
    this.getBikes();
    this.getReports();
  }

  async getBikes() {
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8').set('x-access-token', sessionStorage.getItem('token') ?? "");
    await lastValueFrom(this.http.get<any>(`${environment.apiUrl}/api/v1/bikes`, { headers: headers }).pipe(map(data => {
      let i;
      this.bikes = new Array(data.length);

      if (data.length > 0) {
        for (i = 0; i < data.length; i++) {
          this.bikes[i] = new Bike(data[i]._id, data[i].code, data[i].model, data[i].type, data[i].rentalPointName, data[i].state);
        }
      }
    })));
  }

  async researchBikeCode(event: any) {
    if (event.target.value != "") {
      // @ts-ignore
      const params = new HttpParams().set('code', event.target.value)
      const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8').set('x-access-token', sessionStorage.getItem('token') ?? "");

      await lastValueFrom(this.http.get<any>(`${environment.apiUrl}/api/v2/bikes/code`, { params, headers: headers }).pipe(map(data => {
        this.bikes = undefined;
        if (data['bike'] != undefined) {
          this.bikes = new Array(1);
          let tmpBike = new Bike(data['bike']._id, data['bike'].code, data['bike'].model, data['bike'].type, data['bike'].rentalPointName, data['bike'].state);
          this.bikes[0] = tmpBike
        }
      })));
    } else {
      await this.getBikes();
    }
  }

  getBike() {
    let bike = undefined;
    let id = this.selectedBikeId;

    // @ts-ignore
    for (let i = 0; i < this.bikes.length; i++) {
      // @ts-ignore
      if (this.bikes[i].id == id) {
        // @ts-ignore
        bike = this.bikes[i];
      }
    }
    return bike;
  }

  selectReport(event: any) {
    // @ts-ignore
    if (event != undefined) {
      this.selectedReportId = event.target.id;
    }
    console.log(this.selectedReportId)
    if (this.reports != null) {
      for (let i = 0; i < this.reports.length; i++) {
        // @ts-ignore
        if (this.reports[i]._id == this.selectedReportId) {
          // @ts-ignore
          this.selectedReport = this.reports[i];
        }
      }
    }

    // @ts-ignore
    document.getElementById("reportInfoBox").style.display = 'block';
  }

  deleteInfo() {
    // @ts-ignore
    document.getElementById("reportDamageError").style.display = 'none';
    // @ts-ignore
    document.getElementById("reportDamageInfo").style.display = 'none';
  }

  async newDamageReport(description: string, selectBikeId: string, event: any) {
    event.preventDefault()

    let id = selectBikeId
    const body = { id, description };
    // @ts-ignore
    document.getElementById("reportDamageError").style.display = 'none';
    // @ts-ignore
    document.getElementById("reportDamageInfo").style.display = 'none';

    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8').set('x-access-token', sessionStorage.getItem('token') ?? "");
    await lastValueFrom(this.http.post<any>(`${environment.apiUrl}/api/v2/damage`, body, { headers: headers }).pipe(map(data => {
      // @ts-ignore      
      document.getElementById("reportDamageInfo")?.style.display = 'block';
      // @ts-ignore
      document.getElementById("reportDamageInfo")?.innerHTML = data.message;
      return of([]);
    }), catchError(error => {
      // @ts-ignore
      document.getElementById("reportDamageError").style.display = 'block';
      // @ts-ignore
      document.getElementById("reportDamageError")?.innerHTML = error.error.message;
      return of([]);
    })))
  }

  async getReports() {
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8').set('x-access-token', sessionStorage.getItem('token') ?? "");
    await lastValueFrom(this.http.get<any>(`${environment.apiUrl}/api/v2/damage`, { headers: headers }).pipe(map(data => {
      let i;
      this.reports = new Array(data.length);

      if (data.length > 0) {
        for (i = 0; i < data.length; i++) {
          this.reports[i] = new Report(data[i].id, data[i].description, data[i]._id);
          console.log(data[i].id + " " + data[i].description)
          let tmpCode = "";
        }
      }
    })));

    console.log(this.reports)
  }


}

class DamageReport {
  code: string | undefined;
  description: string | undefined;

  constructor(code: string, description: string) {
    this.code = code;
    this.description = description;
  }
}

class Bike {
  id: string;
  code: string | undefined;
  model: string | undefined;
  type: string | undefined;
  rentalPointName: string | undefined;
  state: string | undefined;

  constructor(id: string, code: string, model: string, type: string, rentalPointName: string, state: string) {
    this.id = id;
    this.code = code;
    this.model = model;
    this.type = type;
    this.rentalPointName = rentalPointName;
    this.state = state;
  }

}


class Report {
  _id: string;
  id: string;
  description: string | undefined;
  code: string | undefined;

  constructor(id: string, description: string, _id: string) {
    this._id = _id;
    this.id = id;
    this.description = description;
    this.code = "";
  }

}