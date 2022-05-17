import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AgmCoreModule } from '@agm/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routes';
import { HeaderComponent } from './header/header.component';
import { RentalPointComponent } from './rentalPoint/rentalPoint.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { BikeComponent } from './bike/bike.component';
import { BookingComponent } from './booking/booking.component';

@NgModule({
  declarations: [
    AppComponent,HeaderComponent,
    RentalPointComponent, BikeComponent, BookingComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AgmCoreModule.forRoot({ apiKey: '', libraries: ['places']}),
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
