import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { catchError, lastValueFrom, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'bike-root',
  templateUrl: './bike.component.html',
  providers: []
})
export class BikeComponent {
  bikes: Bike[] | undefined;
  selectedBikeId: string = "";
  rentalName: string[] | undefined;

  constructor(private router: Router, private _ActivatedRoute: ActivatedRoute, private http: HttpClient) {
    this.getRentalPointsName();
    this.getBikes();
  }

  async getRentalPointsName() {
    await lastValueFrom(this.http.get<any>(`${environment.apiUrl}/api/v1/rentals/name`).pipe(map(data => {
      let i;
      this.rentalName = new Array(data.length);

      if (data.length > 0) {
        for (i = 0; i < data.length; i++) {
          this.rentalName[i] = data[i].name;
        }
      }
    })));
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
    console.log("from getbikes")
    console.log(this.bikes)
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

  async newBike(code: string, model: string, type: string, rentalPointName: string, event: any) {
    event.preventDefault()

    const body = { code, model, type, rentalPointName };
    // @ts-ignore
    document.getElementById("creationBikeError").style.display = 'none';

    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8').set('x-access-token', sessionStorage.getItem('token') ?? "");
    await lastValueFrom(this.http.post<any>(`${environment.apiUrl}/api/v1/bikes`, body, { headers: headers }).pipe(map(data => {
      this.updateInfoAdd(code);
    }), catchError(error => {
      // @ts-ignore
      document.getElementById("creationBikeError").style.display = 'block';
      // @ts-ignore
      document.getElementById("creationBikeError")?.innerHTML = error.error.message;
      return of([]);
    })))
  }

  async updateInfoAdd(code: string) {
    await this.getBikes();
    this.selectedBikeId = code;
    this.selectBike(undefined);
  }

  async repareBike() {
    let bike = this.getBike();

    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8').set('x-access-token', sessionStorage.getItem('token') ?? "");
    await lastValueFrom(this.http.patch<any>(`${environment.apiUrl}/api/v1/bikes/${this.selectedBikeId}`, null, { headers: headers }).pipe(map(data => {

    })))

    await this.getBikes();
    this.selectBike(undefined);
  }

  async removeBike() {
    let bike = this.getBike();
    // @ts-ignore    
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8').set('x-access-token', sessionStorage.getItem('token') ?? "");
    await lastValueFrom(this.http.delete<any>(`${environment.apiUrl}/api/v1/bikes/${this.selectedBikeId}`, { headers: headers }).pipe(map(data => {

    })));
    this.selectedBikeId = "";
    await this.getBikes();
    this.selectBike(undefined);
    // @ts-ignore
    document.getElementById("bikeInfoModule").style.display = 'none';
  }

  selectBike(event: any) {
    // @ts-ignore
    document.getElementById("bikeInfoModule").style.display = 'block';

    if (event != undefined) {
      this.selectedBikeId = event.target.id;
    }

    if (this.selectedBikeId != "") {
      let bikeInfo = "";
      let bike = this.getBike();

      // @ts-ignore
      bikeInfo = "<b>Codice bici:</b> " + bike.code + "<br><b>Modello:</b> " + bike.model + "<br><b>Tipo:</b> " + bike.type + "<br><b>Stato:</b> ";
      // @ts-ignore
      if (bike.state == true) { bikeInfo += "utilizzabile " } else { bikeInfo += "in riparazione " }
      bikeInfo += "<br><b>Nome punto di ritiro:</b> " + bike?.rentalPointName;

      // @ts-ignore  
      document.getElementById("bikeInfo").innerHTML = bikeInfo;
    }
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
