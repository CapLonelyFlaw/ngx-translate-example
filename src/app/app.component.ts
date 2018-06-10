import { Component, forwardRef } from '@angular/core';
import { Localization, TRANSLATE_TOKEN } from './ngx-translate-override/ngx-translate';

@Component({
  selector: 'app-root',
  template: `
  <div>app-root</div>
    <div>Child-2 component inherits localizations from app-root</div>
    <div style="color: blue;">APP_CMP_1: {{'APP_CMP_1' | myTranslate}}</div>
    <div style="color: blueviolet;">APP_CMP_2: {{'APP_CMP_2' | myTranslate}}</div>
    <app-child1></app-child1>
    <app-child2></app-child2>
  <div>app-root</div>
  `,
  styleUrls: ['./app.component.css'],
  // tslint:disable-next-line:no-forward-ref
  providers: [{ provide: TRANSLATE_TOKEN, useExisting: forwardRef(() => AppComponent) }]
})
@Localization('./')
export class AppComponent {
  title = 'app';
}
