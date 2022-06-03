import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AgmCoreModule } from '@agm/core';
import { NgxSliderModule } from '@angular-slider/ngx-slider';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routes';
import { HeaderComponent } from './header/header.component';
import { RentalPointComponent } from './rentalPoint/rentalPoint.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BikeComponent } from './bike/bike.component';
import { BookingComponent } from './booking/booking.component';
import { ItineraryComponent } from './itinerary/itinerary.component';
import { ReviewComponent } from './review/review.component';
import { ReportDamageComponent } from './reportDamage/reportDamage.component';

@NgModule({
  declarations: [
    AppComponent, HeaderComponent,
    RentalPointComponent, BikeComponent, BookingComponent, ReportDamageComponent, ItineraryComponent, ReviewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AgmCoreModule.forRoot({ apiKey: '' }),
    NgbModule, NgxSliderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
