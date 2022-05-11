import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http' 
import { lastValueFrom, map } from 'rxjs';


@Component({
  selector: 'signUp-root',
  templateUrl: './signUp.component.html',
  providers: []
})
export class SignUpComponent {
 
  constructor(private router: Router, private _ActivatedRoute: ActivatedRoute, private http: HttpClient) {
    
  }

  verifyPsw(psw: string, psw2: string){
    if(psw == psw2){
      return true;
    } else {
      // @ts-ignore
      document.getElementById("signUpErrorMessage").style.display = 'block';
      // @ts-ignore
      document.getElementById("signUpErrorMessage").innerHTML = "Le password non coincidono";
      return false;
    }      
  }

  async create(email: string, psw: string, psw2:string, target: string, event:any){
    event.preventDefault();
    // @ts-ignore
    document.getElementById("signUpErrorMessage").style.display = 'none';
    if(this.verifyPsw(psw, psw2) == true){
      const params = new HttpParams().set("email", email).set("psw", psw).set("target", target);
      //console.log(params);
      await lastValueFrom(this.http.post<any>('http://localhost:8080/api/v1/account/signUp', params).pipe(map( data => { 
        if(data.success == false){
            // @ts-ignore
            document.getElementById("signUpErrorMessage").style.display = 'block';
            // @ts-ignore
            document.getElementById("signUpErrorMessage").innerHTML = data.message;
        } else{
            sessionStorage.setItem("email", data.email);
            sessionStorage.setItem("userID", data.id);
            sessionStorage.setItem("permissions", data.permissions);
        }
      })))
    }      
  } 

   

}
