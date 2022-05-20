import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http' 
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
    await lastValueFrom(this.http.get<any>(`${environment.apiUrl}/api/v1/rental/name`).pipe(map(data => {
      let i;
      this.rentalName = new Array(data.rentalPoints.length);
    
      if (data.rentalPoints.length > 0) {
        for (i = 0; i < data.rentalPoints.length; i++) {
          this.rentalName[i] = data.rentalPoints[i].name;
        }
      }
    })));
}

  async getBikes(){
    await lastValueFrom(this.http.get<any>(`${environment.apiUrl}/api/v1/bike`).pipe(map(data => {
      let i;
      this.bikes = new Array(data.bikes.length);
      
      if (data.bikes.length > 0) {
        for (i = 0; i < data.bikes.length; i++) {
          this.bikes[i] = new Bike(data.bikes[i].code, data.bikes[i].model, data.bikes[i].type, data.bikes[i].rentalPointName, data.bikes[i].state);
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
    
    const params = new HttpParams().set("code", code).set("model", model).set("type", type).set("rentalPointName", rentalPointName);
    // @ts-ignore
    document.getElementById("creationBikeError").style.display = 'none';

    await lastValueFrom(this.http.post<any>(`${environment.apiUrl}/api/v1/bike`, params).pipe(map( data => { 
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
    const params = new HttpParams().set("code", this.selectedBikeCode).set("rentalPointName", bike.rentalPointName);    
    await lastValueFrom(this.http.put<any>(`${environment.apiUrl}/api/v1/bike`, params).pipe(map( data => { 
       
    })))

    await this.getBikes(); 
    this.selectBike(undefined);     
  }

  async removeBike(){ 
    let bike = this.getBike();
    // @ts-ignore
    const params = new HttpParams().set('code', this.selectedBikeCode).set("rentalPointName", bike.rentalPointName); 
    await lastValueFrom(this.http.delete<any>(`${environment.apiUrl}/api/v1/bike`, {params} ).pipe(map(data => {
        
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
      await lastValueFrom(this.http.get<any>(`${environment.apiUrl}/api/v1/bike/code`, { params }).pipe(map(data => {      
        this.bikes = undefined;
        
        if (data.bike != null) {
          this.bikes = new Array(1);
          this.bikes[0] = new Bike(data.bike.code, data.bike.model, data.bike.type, data.bike.rentalPointName, data.bike.state);
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
