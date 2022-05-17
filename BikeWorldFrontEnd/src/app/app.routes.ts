import { NgModule } from "@angular/core";
import {RouterModule, Routes } from "@angular/router";
import { AccountComponent } from "./account/account.component";
import { SignUpComponent } from "./signUp/signUp.component";
import { userLoggedGuard } from "./guards/userLoggedGuard.component";
import { RentalPointComponent } from "./rentalPoint/rentalPoint.component";
import { BikeComponent } from "./bike/bike.component";
import { BookingComponent } from "./booking/booking.component";


// @ts-ignore
export const appRoutes: Routes =  [
  //{ path: "", redirectTo: 'home/:name', pathMatch: 'full' }
  { path: "signUp", component: SignUpComponent},
  { path: "account", component: AccountComponent, canActivate: [userLoggedGuard]},
  { path: "rentalPoint", component: RentalPointComponent},
  { path: "bike", component: BikeComponent},
  { path: "booking", component: BookingComponent}
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [RouterModule],
  providers: [userLoggedGuard]
})
export class AppRoutingModule { }