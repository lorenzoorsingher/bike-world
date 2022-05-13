import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http' 
import { lastValueFrom, map } from 'rxjs';


@Component({
  selector: 'rental-point-root',
  templateUrl: './rentalPoint.component.html',
  styleUrls: ['./rentalPoint.component.css']
})
export class RentalPointComponent  {
    title = 'My first AGM project';
    latP1 = 46.06698;
    lngP1 = 11.15503;
    latP2 = 46.129417;
    lngP2 = 11.242521;
    rentalPoints: RentalPoint[] | undefined; 
    selectedRentalName: string = "";
    change = false;

  constructor(private http: HttpClient) {
    this.getRentalPoints();
  }   

  async newRentalPoint(name: string, address: string, lat: number, lng:number, bikeNumber: number, event:any){
    event.preventDefault()
    
    const params = new HttpParams().set("name", name).set("address", address).set("lat", lat).set("lng", lng).set("bikeNumber", bikeNumber);
    //console.log(params);
    await lastValueFrom(this.http.post<any>('http://localhost:8080/api/v1/rental', params).pipe(map( data => { 
       
    })))

    this.getRentalPoints();
    this.selectRentalPoint(undefined);          
  }

  allowRentalPointChange(){
    this.change = true;
    let rentalPoint = this.getRentalPoint();

    // @ts-ignore
    document.getElementById("nameChange").value = rentalPoint.name;
    // @ts-ignore
    document.getElementById("addressChange").value = rentalPoint.address;
    // @ts-ignore
    document.getElementById("latChange").value = rentalPoint.lat;
    // @ts-ignore
    document.getElementById("lngChange").value = rentalPoint.lng;
    // @ts-ignore
    document.getElementById("bikeNumberChange").value = rentalPoint.bikeNUmber;
  }
  
  async changeRentalPoint(name: string, address: string, lat: number, lng:number, bikeNumber: number, event:any){
    event.preventDefault()
    
    const params = new HttpParams().set("name", name).set("address", address).set("lat", lat).set("lng", lng).set("bikeNumber", bikeNumber);
    //console.log(params);
    await lastValueFrom(this.http.put<any>('http://localhost:8080/api/v1/rental', params).pipe(map( data => { 
       
    })))

    this.change = false;  
    this.getRentalPoints(); 
    this.selectRentalPoint(undefined);        
  }

  async getRentalPoints(){
      await lastValueFrom(this.http.get<any>('http://localhost:8080/api/v1/rental').pipe(map(data => {
        console.log(data.rentalPoints);
        let i;
        this.rentalPoints = new Array(data.rentalPoints.length);
        
        if (data.rentalPoints.length > 0) {
          for (i = 0; i < data.rentalPoints.length; i++) {
            this.rentalPoints[i] = new RentalPoint(data.rentalPoints[i].id, data.rentalPoints[i].name, data.rentalPoints[i].address, data.rentalPoints[i].lat, data.rentalPoints[i].lng, data.rentalPoints[i].bikeNumber);
          }
        }
      })));
  }

  addItemOptions(){
    return sessionStorage.getItem("permissions") != undefined && sessionStorage.getItem("permissions") == 'true';
  }

  getRentalPoint(){
    let rentalPoint = undefined;
    let name = this.selectedRentalName;

    // @ts-ignore
    for(let i = 0; i < this.rentalPoints.length; i++){
      // @ts-ignore
      if(this.rentalPoints[i].name == name){
          // @ts-ignore
          rentalPoint = this.rentalPoints[i];
      }
    }
    return rentalPoint;
  }

  selectRentalPoint(event: any){
    if(event != undefined){
      this.selectedRentalName = event.target.id;
    }
    let rentalInfo = "";
    let rentalPoint = this.getRentalPoint();    

    // @ts-ignore
    rentalInfo = "Nome negozio: " + rentalPoint.name + "<br>Indirizzo: "+ rentalPoint.address + "<br>Numero di bici disponibili: "+ rentalPoint.bikeNUmber;

    // @ts-ignore  
    document.getElementById("rentalShopSelected").innerHTML = rentalInfo;
    
  }

  async removeRentalPoint(){  
    const params = new HttpParams().set('name', this.selectedRentalName)
    await lastValueFrom(this.http.delete<any>('http://localhost:8080/api/v1/rental', {params} ).pipe(map(data => {
        
    })));
    this.selectedRentalName = "";
    this.getRentalPoints();
  }
}

class RentalPoint{
  id: string | undefined;
  name: string | undefined;
  address: string | undefined;
  lat: number | undefined;
  lng: number | undefined;
  bikeNUmber: number | undefined;

  constructor(id: string, name: string, address: string, lat: number, lng: number, bikeNumber: number){
    this.id = id;
    this.name = name;
    this.address = address;
    this.lat = lat;
    this.lng = lng;
    this.bikeNUmber = bikeNumber;
  }

}
