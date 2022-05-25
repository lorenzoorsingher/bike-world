import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AccountComponent } from "./account/account.component";
import { SignUpComponent } from "./signUp/signUp.component";
import { userLoggedGuard } from "./guards/userLoggedGuard.component";
import { RentalPointComponent } from "./rentalPoint/rentalPoint.component";
import { ReportDamageComponent } from "./reportDamage/reportDamage.component";
import { BikeComponent } from "./bike/bike.component";
import { BookingComponent } from "./booking/booking.component";
import { adminGuard } from "./guards/adminGuard.component";


// @ts-ignore
export const appRoutes: Routes = [
  //{ path: "", redirectTo: 'home/:name', pathMatch: 'full' }
  { path: "signUp", component: SignUpComponent },
  { path: "account", component: AccountComponent, canActivate: [userLoggedGuard] },
  { path: "rentalPoint", component: RentalPointComponent },
  { path: "bike", component: BikeComponent, canActivate: [adminGuard] },
  { path: "booking", component: BookingComponent, canActivate: [userLoggedGuard] },
  { path: "reportDamage", component: ReportDamageComponent, canActivate: [userLoggedGuard] },
  { path: "", redirectTo: "rentalPoint", pathMatch: "full" }
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [RouterModule],
  providers: [userLoggedGuard, adminGuard]
})
export class AppRoutingModule { }