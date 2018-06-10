import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';


import { AppComponent } from './app.component';
import { AppTranslateLoader } from './services/translate.service';
import { MyTranslateDirective, MyTranslatePipe } from './ngx-translate-override/ngx-translate';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { Child1Component } from './child1/child1.component';
import { Child2Component } from './child2/child2.component';

export function translationLoader(loader: AppTranslateLoader) {
  return () => loader.loadTranslation();
}

@NgModule({
  declarations: [
    AppComponent,
    MyTranslatePipe,
    MyTranslateDirective,
    Child1Component,
    Child2Component
],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot(),
  ],
  providers: [
    AppTranslateLoader,
    {
      provide: APP_INITIALIZER,
      useFactory: translationLoader,
      deps: [AppTranslateLoader],
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
