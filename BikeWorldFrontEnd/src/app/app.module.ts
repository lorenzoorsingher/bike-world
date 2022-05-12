import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AgmCoreModule } from '@agm/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routes';
import { HeaderComponent } from './header/header.component';
import { RentalPointComponent } from './rentalPoint/rentalPoint.component';

@NgModule({
  declarations: [
    AppComponent,HeaderComponent,
    RentalPointComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AgmCoreModule.forRoot({ apiKey: ''})
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
