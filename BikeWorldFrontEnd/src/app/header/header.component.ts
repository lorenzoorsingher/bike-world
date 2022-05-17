import {Component} from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import {lastValueFrom, map} from "rxjs";
import { Router } from '@angular/router';


@Component({
  selector: 'app-header',
  templateUrl: `./header.component.html`,
  styleUrls: ['./header.component.css']
})


export class HeaderComponent {
  title = 'header';
  sessionStorageHeader = sessionStorage;

  constructor(private http: HttpClient, private router: Router) {

  }

  async loginFunction(username: string, psw:string){
    const body = {
      "username": username,      
      "password": psw
    };
    
    const headers = new HttpHeaders().set('Content-Type', 'application/json; charset=utf-8');
    await lastValueFrom(this.http.post<any>('http://localhost:8080/api/v1/users/login', body, {headers: headers}).pipe(map(data => {
        if(data.success == true) {
            this.sessionStorageHeader.setItem("username", data.username);
            this.sessionStorageHeader.setItem("userID", data.id);
            this.sessionStorageHeader.setItem("permissions", data.permissions);
            this.sessionStorageHeader.setItem("token", data.token);
        } else {
            // @ts-ignore
            document.getElementById("loginErrorMessage").style.display = 'block';
        }
    })));
  }

  logout(){
    this.sessionStorageHeader.removeItem("userID");
    this.sessionStorageHeader.removeItem("username");
    this.sessionStorageHeader.removeItem("permissions");
    this.router.navigate(['/']);    
  }

  checkPermissions(){
    return this.sessionStorageHeader.getItem("permissions") == 'true';
  }
}

