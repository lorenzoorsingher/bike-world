import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http'
import { lastValueFrom, map, Observable } from 'rxjs';
import { AgmMap, MapsAPILoader } from '@agm/core';


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
    const params = new HttpParams().set("username", sessionStorage.getItem("username")).set("date", date).set("bikeCode", bikeCode).set("rentalPointName", rentalPointName);
    await lastValueFrom(this.http.post<any>('http://localhost:8080/api/v1/booking', params).pipe(map(data => {
        if(data.success == false){
            // @ts-ignore
            document.getElementById("errorMessage").innerHTML = data.message;
        }
    })))

    this.getBookings();
  }

  async getBookings() {
    // @ts-ignore
    const params = new HttpParams().set("username", sessionStorage.getItem("username"));
    await lastValueFrom(this.http.get<any>('http://localhost:8080/api/v1/booking', {params}).pipe(map(data => {
      let i;
      this.bookings = new Array(data.bookings.length);

      if (data.bookings.length > 0) {
        for (i = 0; i < data.bookings.length; i++) {
          this.bookings[i] = new Booking(data.bookings[i]._id, data.bookings[i].username, data.bookings[i].date, data.bookings[i].bikeCode, data.bookings[i].releaseBikeCode, data.bookings[i].rentalPointName);
        }
      }
    })));
  }

  async getRentalPoints() {
    await lastValueFrom(this.http.get<any>('http://localhost:8080/api/v1/rental').pipe(map(data => {
      let i;
      this.rentalPoints = new Array(data.rentalPoints.length);

      if (data.rentalPoints.length > 0) {
        for (i = 0; i < data.rentalPoints.length; i++) {
          this.rentalPoints[i] = new RentalPoint(data.rentalPoints[i].id, data.rentalPoints[i].name, data.rentalPoints[i].address, data.rentalPoints[i].lat, data.rentalPoints[i].lng, data.rentalPoints[i].type, data.rentalPoints[i].bikeNumber);
        }
      }
    })));
  }

  async getBikes(date: Date, rentalPointName: string){
    // @ts-ignore
    const params = new HttpParams().set("rentalPointName", rentalPointName).set("date", date);
    await lastValueFrom(this.http.get<any>('http://localhost:8080/api/v1/booking/bikeAvailable', {params}).pipe(map(data => {
      let i;
      this.bikes = new Array(data.bikes.length);
      
      if (data.bikes.length > 0) {
        for (i = 0; i < data.bikes.length; i++) {
          this.bikes[i] = new Bike(data.bikes[i].code, data.bikes[i].model, data.bikes[i].type, data.bikes[i].rentalPointName, data.bikes[i].state);
        }
      }
    })));
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
        const params = new HttpParams().set('_id', this.selectedBookingId); 
        await lastValueFrom(this.http.delete<any>('http://localhost:8080/api/v1/booking', {params} ).pipe(map(data => {
            
        })));
        this.selectedBookingId = "";
        await this.getBookings();
        this.selectBooking(undefined);
        // @ts-ignore
        document.getElementById("bookingInfoModule").style.display = 'none';  
    }

    selectBooking(event: any){   
        // @ts-ignore
        document.getElementById("bookingInfoModule").style.display = 'block';
        
        if(event != undefined){
          this.selectedBookingId = event.target.id;
        }  
    
        if(this.selectedBookingId != ""){
          let bookingInfo = "";
          let booking = this.getBooking();    
    
          // @ts-ignore
          bookingInfo = "<br>Data: " + booking.date + "<br>Bici: " + booking.bikeCode + "<br>Punto noleggio: " + booking.rentalPointName + "<br>Codice di sblocco: <b>" + booking.releaseCode + "</b>"; 
        
    
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
