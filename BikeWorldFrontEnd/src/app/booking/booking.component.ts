import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { catchError, lastValueFrom, map, Observable, of } from 'rxjs';
import { AgmMap, MapsAPILoader } from '@agm/core';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'booking-point-root',
  templateUrl: './booking.component.html'
})
export class BookingComponent {
  bookings: Booking[] | undefined;  
  bikes: Bike[] | undefined; 
  rentalPoints: RentalPoint[] | undefined;
  selectedBookingId: any | undefined;

  constructor(private http: HttpClient, private apiloader: MapsAPILoader) {
    this.getBookings();
    this.getRentalPoints();
  }

  async newBooking(date: Date, rentalPointName: string, bikeCode: string, event: any) {
    event.preventDefault()
    // @ts-ignore
    const body = {
      date,
      bikeCode,
      rentalPointName
    };
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8').set('x-access-token', sessionStorage.getItem('token') ?? "");
    await lastValueFrom(this.http.post<any>(`${environment.apiUrl}/api/v1/bookings`, body, {headers: headers}).pipe(map(data => {
        if(data.success == false){
            // @ts-ignore
            document.getElementById("errorMessage").innerHTML = data.message;
        }
    })))
    
    // @ts-ignore
    document.getElementById("bookingDeleteErrorMessage").style.display = 'none';
    this.getBookings();
  }

  async getBookings() {
    // @ts-ignore
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8').set('x-access-token', sessionStorage.getItem('token') ?? "");
    await lastValueFrom(this.http.get<any>(`${environment.apiUrl}/api/v1/bookings`, {headers: headers}).pipe(map(data => {
      let i;
      this.bookings = new Array(data.length);

      if (data.length > 0) {
        for (i = 0; i < data.length; i++) {
          this.bookings[i] = new Booking(data[i]._id, data[i].username, data[i].date, data[i].bikeCode, data[i].releaseBikeCode, data[i].rentalPointName);
        }
      }
    })));
  }

  async getRentalPoints() {
    await lastValueFrom(this.http.get<any>(`${environment.apiUrl}/api/v1/rentals`).pipe(map(data => {
      let i;
      this.rentalPoints = new Array(data.rentalPoints.length);

      if (data.rentalPoints.length > 0) {
        for (i = 0; i < data.rentalPoints.length; i++) {
          this.rentalPoints[i] = new RentalPoint(data.rentalPoints[i].id, data.rentalPoints[i].name, data.rentalPoints[i].address, data.rentalPoints[i].lat, data.rentalPoints[i].lng, data.rentalPoints[i].type, data.rentalPoints[i].bikeNumber);
        }
      }
    })));
  }

  async getBikes(){
    // @ts-ignore
    document.getElementById("bikeNumberError").style.display = 'none'; 

    // @ts-ignore
    let date = document.getElementById("date").value;
    // @ts-ignore
    let rentalPointName =  document.getElementById("rentalPointName").value;
    // @ts-ignore  
    document.getElementById("bikeNumberError").innerHTML = "";
    
    if(date){
      if(new Date(date) > new Date()){
        // @ts-ignore
        const params = new HttpParams().set("rentalPointName", rentalPointName).set("date", date);
        const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8').set('x-access-token', sessionStorage.getItem('token') ?? "");
        await lastValueFrom(this.http.get<any>(`${environment.apiUrl}/api/v1/bookings/bikeAvailable`, {params, headers: headers}).pipe(map(data => {
          let i;
          this.bikes = new Array(data.length);
          
          if (data.length > 0) {
            for (i = 0; i < data.length; i++) {
              this.bikes[i] = new Bike(data[i].code, data[i].model, data[i].type, data[i].rentalPointName, data[i].state);
            }
          } else {
            // @ts-ignore
            document.getElementById("bikeNumberError").style.display = 'block';  
            // @ts-ignore  
            document.getElementById("bikeNumberError").innerHTML = "Nessuna bicicletta disponibile";
          }
        })));
      } else{
      // @ts-ignore
      document.getElementById("bikeNumberError").style.display = 'block';  
      // @ts-ignore  
      document.getElementById("bikeNumberError").innerHTML = "Inserisci una data futura";
      }
    }else{
      // @ts-ignore
      document.getElementById("bikeNumberError").style.display = 'block';  
      // @ts-ignore  
      document.getElementById("bikeNumberError").innerHTML = "Inserisci una data";
    }
  }

    getBooking(){
        let booking = undefined;
        let _id = this.selectedBookingId;

        // @ts-ignore
        for(let i = 0; i < this.bookings.length; i++){
            // @ts-ignore
            if(this.bookings[i]._id == _id){
                // @ts-ignore
                booking = this.bookings[i];
            }
        }
        return booking;
    }

    async removeBooking(){ 
        // @ts-ignore
        const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8').set('x-access-token', sessionStorage.getItem('token') ?? "");
        await lastValueFrom(this.http.delete<any>(`${environment.apiUrl}/api/v1/bookings/${this.selectedBookingId}`, {headers: headers} ).pipe(map(data => {
            
        }), catchError(error => {
          // @ts-ignore
          document.getElementById("bookingDeleteErrorMessage").style.display = 'block';
          // @ts-ignore
          document.getElementById("bookingDeleteErrorMessage").innerHTML = error.error.message;
          return of([]);
        })));
        this.selectedBookingId = "";
        await this.getBookings();
        this.selectBooking(undefined);
        // @ts-ignore
        document.getElementById("bookingInfoModule").style.display = 'none';  
    }

    selectBooking(event: any){   
        // @ts-ignore
        document.getElementById("bookingDeleteErrorMessage").style.display = 'none';
        // @ts-ignore
        document.getElementById("bookingInfoModule").style.display = 'block';
        
        if(event != undefined){
          this.selectedBookingId = event.target.id;
        }  
    
        if(this.selectedBookingId != ""){
          let bookingInfo = "";
          let booking = this.getBooking();    
    
          // @ts-ignore
          let date = ((booking.date).toString()).split("T");
          // @ts-ignore
          let arrayDate = (date[0]).split("-");

          // @ts-ignore
          bookingInfo = "<b>Data:</b> " + arrayDate[2] + "-" + arrayDate[1] + "-" + arrayDate[0] + "<br><b>Punto noleggio:</b> " + booking.rentalPointName + "<br><b>Bici:</b> " + booking.bikeCode + "<br><b>Codice di sblocco:</b> <i>" + booking.releaseCode + "</i>"; 
    
          // @ts-ignore  
          document.getElementById("bookingInfo").innerHTML = bookingInfo;
        }
      }
}

class Booking {
    _id: any | undefined;
    username: string | undefined;
	  date: Date | undefined;
    bikeCode: string | undefined;
    releaseCode: number | undefined;
    rentalPointName: string | undefined; 

  constructor(_id: any, username: string, date: Date, bikeCode: string, releaseCode: number, rentalPointName: string) {
    this._id = _id;
    this.username = username;
    this.date = date;
    this.bikeCode = bikeCode;
    this.releaseCode = releaseCode;
    this.rentalPointName = rentalPointName;
  }
}

class RentalPoint {
    id: string | undefined;
    name: string | undefined;
    address: string | undefined;
    lat: number = 0;
    lng: number = 0;
    type: string | undefined;
    bikeNUmber: number | undefined;
  
    constructor(id: string, name: string, address: string, lat: number, lng: number, type: string, bikeNumber: number) {
      this.id = id;
      this.name = name;
      this.address = address;
      this.lat = lat;
      this.lng = lng;
      this.type = type;
      this.bikeNUmber = bikeNumber;
  
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
