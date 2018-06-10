import { Component, OnInit, forwardRef } from '@angular/core';
import { TRANSLATE_TOKEN, Localization } from '../ngx-translate-override/ngx-translate';

@Component({
  selector: 'app-child1',
  template: `
    <div>child-1</div>
    Child-1 component with own localizations
    <div style="color: yellowgreen;" myTranslate="SOME"></div>
    <div>child-1</div>
  `,
  styleUrls: ['./child1.component.css'],
  providers: [{provide: TRANSLATE_TOKEN, useExisting: forwardRef(() => Child1Component)}]
})
@Localization('./')
export class Child1Component implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
