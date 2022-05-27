import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'
import { catchError, lastValueFrom, map, Observable, of } from 'rxjs';
import { AgmMap, MapsAPILoader } from '@agm/core';
import noUiSlider from 'nouislider';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ConditionalExpr } from '@angular/compiler';
import { LabelType, Options } from '@angular-slider/ngx-slider';


@Component({
  selector: 'itinerary-root',
  templateUrl: './itinerary.component.html',
  styleUrls: ['./itinerary.component.css']
})
export class ItineraryComponent{
  latC = 45.4654219;
  lngC = 9.1859243;
  itineraries: Itinerary[] | undefined;
  selectedItineraryId: string = "";

  minValue: number = 15.0;
  maxValue: number = 150.0;
  options: Options = {
    floor: 0.0,
    ceil: 150.0,
    step: 15.0,
    showTicks: true
  };

  constructor(private http: HttpClient, private apiloader: MapsAPILoader, private router: Router) {
    this.getItineraries();   
  }

  async newItinerary(name: string, addressStarting: string, latS: number, lngS: number, description: string, length: number, difficulty: string, event: any) {
    event.preventDefault()
    // @ts-ignore
    document.getElementById("creationItineraryError")?.style.display = "none";

    if(this.checkLatLng(latS, lngS) == true){
      const body = {
        name,
        addressStarting, 
        description,
        latS,
        lngS, 
        difficulty,
        length    
    };
      const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8').set('x-access-token', sessionStorage.getItem('token') ?? "");
      await lastValueFrom(this.http.post<any>(`${environment.apiUrl}/api/v2/itineraries`, body, {headers: headers}).pipe(map(data => {
        this.router.navigate(['/itinerary']);    
      }), catchError(error => {
        // @ts-ignore
        document.getElementById("creationItineraryError")?.style.display = "block";
        // @ts-ignore
        document.getElementById("creationItineraryError")?.innerHTML = error.error.message;
        return of([]);
      })))

      this.getItineraries();
      this.selectItinerary(undefined);
    } else {
      // @ts-ignore
      document.getElementById("creationItineraryError")?.style.display = "block";
      // @ts-ignore
      document.getElementById("creationItineraryError")?.innerHTML = "Valore latitudine o longitudine errati";
    }
  }

  async changeItinerary(addressStarting: string, latS: number, lngS: number, description: string, length: number, difficulty: string, event: any) {
    event.preventDefault()
    // @ts-ignore
    document.getElementById("changeItineraryError")?.style.display = "none";

    if(this.checkLatLng(latS, lngS) == true){
      const body = {
        addressStarting,
        description,
        latS,
        lngS,
        length,
        difficulty
      };
      const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8').set('x-access-token', sessionStorage.getItem('token') ?? "");
      await lastValueFrom(this.http.put<any>(`${environment.apiUrl}/api/v2/itineraries/${this.selectedItineraryId}`, body, {headers: headers}).pipe(map(data => {
        
      }), catchError(error => {
          console.log(error);
        // @ts-ignore
        document.getElementById("changeItineraryError")?.style.display = "block";
        // @ts-ignore
        document.getElementById("changeItineraryError")?.innerHTML = error.error.message;
        return of([]);
      })))

      // @ts-ignore
      document.getElementById("changeItineraryForm").style.display = 'none';
      // @ts-ignore
      document.getElementById("addItineraryForm").style.display = 'block';
      await this.getItineraries();
      this.selectItinerary(undefined);
    } else {
        // @ts-ignore
        document.getElementById("changeItineraryError")?.style.display = "block";
        // @ts-ignore
        document.getElementById("changeItineraryError")?.innerHTML = "Valore latitudine o longitudine errati";
    }
  }

  async removeItinerary() {    
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8').set('x-access-token', sessionStorage.getItem('token') ?? "");
    await lastValueFrom(this.http.delete<any>(`${environment.apiUrl}/api/v2/itineraries/${this.selectedItineraryId}`, { headers: headers }).pipe(map(data => {

    }), catchError(error => {
      // @ts-ignore
      document.getElementById("changeItineraryError")?.style.display = "block";
      // @ts-ignore
      document.getElementById("changeItineraryError")?.innerHTML = error.error.message;
      return of([]);
    })));
    this.selectedItineraryId = "";
    await this.getItineraries();
    this.selectItinerary(undefined);
  }

  async getItineraries() {
    await lastValueFrom(this.http.get<any>(`${environment.apiUrl}/api/v2/itineraries`).pipe(map(data => {
      let i;
      this.itineraries = new Array(data.length);

      if (data.length > 0) {
        for (i = 0; i < data.length; i++) {
          this.itineraries[i] = new Itinerary(data[i]._id, data[i].name, data[i].addressStarting, data[i].description, data[i].latS, data[i].lngS, data[i].difficulty, data[i].length);
        }
      }
    })));
  }

  addItemOptions() {
    return sessionStorage.getItem("permissions") != undefined && sessionStorage.getItem("permissions") == 'true';
  }

  checkLatLng(lat: number, lng: number){
    if(lat > 90 || lat < -90 || lng > 180 || lng < -180){
      return false;
    } else {
      return true;
    }
  }

  annullaModifica(){
    // @ts-ignore
    document.getElementById("changeItineraryForm").style.display = 'none';
    // @ts-ignore
    document.getElementById("addItineraryForm").style.display = 'block';
  }

  allowItineraryChange() {
    // @ts-ignore
    document.getElementById("addItineraryForm").style.display = 'none';
    // @ts-ignore
    document.getElementById("changeItineraryForm").style.display = 'block';
    let itinerary = this.getItinerary();
    
    // @ts-ignore
    document.getElementById("nameChange").value = itinerary.name;
    // @ts-ignore
    document.getElementById("addressStartingChange").value = itinerary.addressStarting;
    // @ts-ignore
    document.getElementById("descriptionChange").value = itinerary.description;
    // @ts-ignore
    document.getElementById("latSChange").value = itinerary.latS;
    // @ts-ignore
    document.getElementById("lngSChange").value = itinerary.lngS;
    // @ts-ignore
    document.getElementById("difficultyChange").value = itinerary.difficulty;
    // @ts-ignore
    document.getElementById("lengthChange")?.value = itinerary.length;
  }

  getItinerary() {
    let itinerary = undefined;
    let id = this.selectedItineraryId;

    // @ts-ignore
    for (let i = 0; i < this.itineraries.length; i++) {
      // @ts-ignore
      if (this.itineraries[i].id == id) {
        // @ts-ignore
        itinerary = this.itineraries[i];
      }
    }
    return itinerary;
  }

  selectItinerary(event: any) {
    // @ts-ignore
    document.getElementById("changeItineraryForm").style.display = 'none';

    if (event != undefined) {
      this.selectedItineraryId = event.target.id;
    }
    if (this.selectedItineraryId != "") {
      let itineraryInfo = "";
      let itinerary = this.getItinerary();

      // @ts-ignore
      itineraryInfo = "<b>Nome :</b> " + itinerary.name + "<br><b>Indirizzo partenza:</b> " + itinerary.addressStarting+ "<br><b>Descrizione:</b> " + itinerary.description + "<br><b>Difficoltà:</b> " + itinerary?.difficulty + "<br><b>Lunghezza:</b> " + itinerary.length;

      // @ts-ignore  
      document.getElementById("itinerarySelected").innerHTML = itineraryInfo;
    } else {
      // @ts-ignore  
      document.getElementById("itinerarySelected").innerHTML = "";
    }
  }

  showMarkerInfo(event: any) {
    let lat = event.latitude;
    let lng = event.longitude;
    let itinerary;

    // @ts-ignore
    for (let i = 0; i < this.itineraries.length; i++) {
      // @ts-ignore
      if (this.itineraries[i].latS == lat && this.itineraries[i].lngS == lng) {
        // @ts-ignore
        itinerary = this.itineraries[i];
      }
    }
    // @ts-ignore
    this.selectedItineraryId = itinerary?.name;
    let itineraryInfo = "";
    // @ts-ignore
    itineraryInfo = "<b>Nome :</b> " + itinerary.name + "<br><b>Indirizzo partenza:</b> " + itinerary.addressStarting+ "<br><b>Descrizione:</b> " + itinerary.description + "<br><b>Difficoltà:</b> " + itinerary?.difficulty + "<br><b>Lunghezza:</b> " + itinerary.length;
    // @ts-ignore  
    document.getElementById("itinerarySelected").innerHTML = itineraryInfo;

  }

  async filterDifficultyBased(event: any) {
    if (event.target.value != "") {
      let del = true;
      const params = new HttpParams().set('difficulty', event.target.value)
      await lastValueFrom(this.http.get<any>(`${environment.apiUrl}/api/v2/itineraries/difficulty`, { params }).pipe(map(data => {
        let i;
        this.itineraries = new Array(data.length);

        if (data.length > 0) {
          for (i = 0; i < data.length; i++) {
            this.itineraries[i] = new Itinerary(data[i]._id, data[i].name, data[i].addressStarting, data[i].description, data[i].latS, data[i].lngS, data[i].difficulty, data[i].length);
            if (this.itineraries[i].name == this.selectedItineraryId) {
              del = false;
            }
          }
        }
      })));

      if (del == true) {
        this.selectedItineraryId = "";
        // @ts-ignore  
        document.getElementById("itinerarySelected").innerHTML = "";
      }
    } else {
      this.getItineraries();
    }
  }
  
  async filterZoneBased(event: any){
    
    const params = new HttpParams().set('latitude', event.lat).set("longitude", event.lng);
    await lastValueFrom(this.http.get<any>(`${environment.apiUrl}/api/v2/itineraries/zone`, { params }).pipe(map(data => {      
      let i;
      this.itineraries = new Array(data.length);
      if (data.length > 0) {
        for (i = 0; i < data.length; i++) {
            this.itineraries[i] = new Itinerary(data[i]._id, data[i].name, data[i].addressStarting, data[i].description, data[i].latS, data[i].lngS, data[i].difficulty, data[i].length);
        }
      }
    })));

    this.selectItinerary(undefined);
  }

  deleteFilterZoneBased(){
    this.getItineraries();
  }

  async filterLengthBased(event: any){
    let min = parseFloat(event.minValue);
    let max = parseFloat(event.maxValue);
    const params = new HttpParams().set('minLength', min).set("maxLength", max);
    await lastValueFrom(this.http.get<any>(`${environment.apiUrl}/api/v2/itineraries/length`, { params }).pipe(map(data => {      
      let i;
      this.itineraries = new Array(data.length);
      if (data.length > 0) {
        for (i = 0; i < data.length; i++) {
            this.itineraries[i] = new Itinerary(data[i]._id, data[i].name, data[i].addressStarting, data[i].description, data[i].latS, data[i].lngS, data[i].difficulty, data[i].length);
        }
      }
    })));

    this.selectItinerary(undefined);
  }

}

class Itinerary {
  id: string | undefined;
  name: string | undefined;
  addressStarting: string | undefined;
  description: string | undefined;
  latS: number = 0;
  lngS: number = 0;
  difficulty: string | undefined;
  length: number | undefined;

  constructor(id: string, name: string, addressStarting: string, description: string, latS: number, lngS: number, difficulty: string, length: number) {
    this.id = id;
    this.name = name;
    this.addressStarting = addressStarting;
    this.description = description;
    this.latS = latS;
    this.lngS = lngS;
    this.difficulty = difficulty;
    this.length = length;
  }

}
