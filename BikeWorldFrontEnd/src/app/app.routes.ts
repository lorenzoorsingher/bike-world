import { NgModule } from "@angular/core";
import {RouterModule, Routes } from "@angular/router";
import { AccountComponent } from "./account/account.component";
import { SignUpComponent } from "./signUp/signUp.component";


// @ts-ignore
export const appRoutes: Routes =  [
  //{ path: "", redirectTo: 'home/:name', pathMatch: 'full' }
  { path: "signUp", component: SignUpComponent},
  { path: "account", component: AccountComponent}
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }