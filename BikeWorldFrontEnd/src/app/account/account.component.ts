import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http' 
import { lastValueFrom, map } from 'rxjs';


@Component({
  selector: 'account-root',
  templateUrl: './account.component.html',
  providers: []
})
export class AccountComponent implements OnInit {
 
  constructor(private router: Router, private _ActivatedRoute: ActivatedRoute, private http: HttpClient) {
    
  }

  ngOnInit(): void {
    this.setAccountInfo();
  }

  setAccountInfo(){
      // @ts-ignore
    const params = new HttpParams().set("email", sessionStorage.getItem("email"))
    lastValueFrom(this.http.get<any>('http://localhost:8080/api/v1/account', {params}).pipe(map( data => { 

    if(data.success == false){
        // @ts-ignore
        document.getElementById("manageAccountErrorMessage").style.display = 'block';
        // @ts-ignore
        document.getElementById("manageAccountErrorMessage").innerHTML = data.message;
    } else {
        console.log(data.psw);
        // @ts-ignore
        document.getElementById("email").value = data.email;
        // @ts-ignore
        document.getElementById("psw").value = data.psw;
        // @ts-ignore
        document.getElementById("psw2").value = data.psw;
        // @ts-ignore
        document.getElementById("target").value = data.target;
    }
    }))) 
  }

  verifyPsw(psw: string, psw2: string){
    if(psw == psw2){
      return true;
    } else {
      // @ts-ignore
      document.getElementById("manageAccountErrorMessage").style.display = 'block';
      // @ts-ignore
      document.getElementById("manageAccountErrorMessage").innerHTML = "Le password non coincidono";
      return false;
    }      
  }

  async edit(email: string, psw: string, psw2:string, target: string, event:any){
    event.preventDefault();
    // @ts-ignore
    document.getElementById("manageAccountErrorMessage").style.display = 'none';
    if(this.verifyPsw(psw, psw2) == true){
        const params = new HttpParams().set("email", email).set("psw", psw).set("target", target);
        //console.log(params);
        await lastValueFrom(this.http.put<any>('http://localhost:8080/api/v1/account', params).pipe(map( data => { 
          // @ts-ignore
          document.getElementById("manageAccountErrorMessage").style.display = 'block';
            // @ts-ignore
            document.getElementById("manageAccountErrorMessage").innerHTML = data.message;
        
        })))
    }      
  } 

   

}
