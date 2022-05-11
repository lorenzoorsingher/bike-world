import {Component} from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import {lastValueFrom, map} from "rxjs";


@Component({
  selector: 'app-header',
  templateUrl: `./header.component.html`,
  styleUrls: ['./header.component.css']
})


export class HeaderComponent {
  title = 'header';
  sessionStorageHeader = sessionStorage;

  constructor(private http: HttpClient) {

  }

  async loginFunction(email: string, psw:string){
    const params = new HttpParams().set('email', email).set('psw', psw);
    await lastValueFrom(this.http.get<any>('http://localhost:8080/api/v1/authentications', { params }).pipe(map(data => {
        if(data.success == true) {
            this.sessionStorageHeader.setItem("email", data.email);
            this.sessionStorageHeader.setItem("userID", data.id);
            this.sessionStorageHeader.setItem("permissions", data.permissions);
        } else {
            // @ts-ignore
            document.getElementById("loginErrorMessage").style.display = 'block';
        }
    })));
  }

  logout(){
    this.sessionStorageHeader.removeItem("userID");
    this.sessionStorageHeader.removeItem("email");
    this.sessionStorageHeader.removeItem("permissions");
  }

  checkPermissions(){
    return this.sessionStorageHeader.getItem("permissions") == 'true';
  }
}

