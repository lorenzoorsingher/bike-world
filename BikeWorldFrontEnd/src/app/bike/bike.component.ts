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
  selectedBikeCode: string = "";
  rentalName: string[] | undefined;

  constructor(private router: Router, private _ActivatedRoute: ActivatedRoute, private http: HttpClient) {
    this.getRentalPointsName();
    this.getBikes();    
  } 

  async getRentalPointsName(){
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

  async getBikes(){
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8').set('x-access-token', sessionStorage.getItem('token') ?? "");
    await lastValueFrom(this.http.get<any>(`${environment.apiUrl}/api/v1/bikes`, {headers: headers}).pipe(map(data => {
      let i;
      this.bikes = new Array(data.length);
      
      if (data.length > 0) {
        for (i = 0; i < data.length; i++) {
          this.bikes[i] = new Bike(data[i].code, data[i].model, data[i].type, data[i].rentalPointName, data[i].state);
        }
      }
    })));
}

  getBike(){
    let bike = undefined;
    let code = this.selectedBikeCode;

    // @ts-ignore
    for(let i = 0; i < this.bikes.length; i++){
      // @ts-ignore
      if(this.bikes[i].code == code){
          // @ts-ignore
          bike = this.bikes[i];
      }
    }
    return bike;
  }

  async newBike(code: string, model: string, type:string, rentalPointName: string, event:any){
    event.preventDefault()
    
    const body = { code, model, type, rentalPointName };
    // @ts-ignore
    document.getElementById("creationBikeError").style.display = 'none';

    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8').set('x-access-token', sessionStorage.getItem('token') ?? "");
    await lastValueFrom(this.http.post<any>(`${environment.apiUrl}/api/v1/bikes`, body, {headers: headers}).pipe(map( data => { 
      this.updateInfoAdd(code);  
    }), catchError(error => {
      // @ts-ignore
      document.getElementById("creationBikeError").style.display = 'block';
      // @ts-ignore
      document.getElementById("creationBikeError")?.innerHTML = error.error.message;
      return of([]);
    })))          
  }

  async updateInfoAdd(code: string){
    await this.getBikes();
    this.selectedBikeCode=code;
    this.selectBike(undefined);  
  }

  async repareBike(){
    let bike = this.getBike();
    
    // @ts-ignore
    const body = {
      code: this.selectedBikeCode,
      rentalPointName: bike?.rentalPointName
    };    
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8').set('x-access-token', sessionStorage.getItem('token') ?? "");
    await lastValueFrom(this.http.patch<any>(`${environment.apiUrl}/api/v1/bikes`, body, {headers: headers}).pipe(map( data => { 
       
    })))

    await this.getBikes(); 
    this.selectBike(undefined);     
  }

  async removeBike(){ 
    let bike = this.getBike();
    // @ts-ignore
    const params = new HttpParams().set('code', this.selectedBikeCode).set("rentalPointName", bike.rentalPointName); 
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8').set('x-access-token', sessionStorage.getItem('token') ?? "");
    await lastValueFrom(this.http.delete<any>(`${environment.apiUrl}/api/v1/bikes`, {params, headers: headers}).pipe(map(data => {
        
    })));
    this.selectedBikeCode = "";
    await this.getBikes();
    this.selectBike(undefined);
    // @ts-ignore
    document.getElementById("bikeInfoModule").style.display = 'none';  
  }
  
  selectBike(event: any){
    // @ts-ignore
    document.getElementById("bikeInfoModule").style.display = 'block';

    if(event != undefined){
      this.selectedBikeCode = event.target.id;
    }  

    if(this.selectedBikeCode != ""){
      let bikeInfo = "";
      let bike = this.getBike();    

      // @ts-ignore
      bikeInfo = "<b>Codice bici:</b> " + bike.code + "<br><b>Modello:</b> "+ bike.model + "<br><b>Tipo:</b> "+ bike.type + "<br><b>Stato:</b> "; 
      // @ts-ignore
      if(bike.state == true){ bikeInfo += "utilizzabile "} else { bikeInfo += "in riparazione "}
      bikeInfo += "<br><b>Nome punto di ritiro:</b> " + bike?.rentalPointName;

      // @ts-ignore  
      document.getElementById("bikeInfo").innerHTML = bikeInfo;
    }
  }

  async researchBikeCode(event: any){
    if(event.target.value != ""){
      // @ts-ignore
      const params = new HttpParams().set('code', event.target.value) 
      const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8').set('x-access-token', sessionStorage.getItem('token') ?? "");
      await lastValueFrom(this.http.get<any>(`${environment.apiUrl}/api/v1/bikes/code`, { params, headers: headers }).pipe(map(data => {      
        this.bikes = undefined;
        
        if (data != null) {
          this.bikes = new Array(1);
          this.bikes[0] = new Bike(data.code, data.model, data.type, data.rentalPointName, data.state);
        } 
      })));
    }else{
      this.getBikes();
    }

  }

}

class Bike{
  code: string | undefined;
  model: string | undefined;
  type: string | undefined;
  rentalPointName: string | undefined;
  state: string | undefined;

  constructor(code: string, model: string, type:string, rentalPointName:string, state: string){
    this.code = code;
    this.model = model;
    this.type = type;
    this.rentalPointName = rentalPointName;
    this.state = state;
  }

}
