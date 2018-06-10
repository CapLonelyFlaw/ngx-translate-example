import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-child2',
  template: `
    <div>child-2</div>
      <div>Child-2 component inherits localizations from app-root</div>
      <div style="color: blueviolet;">APP_CMP_2: {{'APP_CMP_2' | myTranslate}}</div>
      <div translate="GLOBAL"></div>
    <div>child-2</div>
  `,
  styleUrls: ['./child2.component.css']
})
// no @Localization()
export class Child2Component implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
