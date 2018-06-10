import {
    Injector,
    Pipe,
    PipeTransform,
    ChangeDetectorRef,
    InjectionToken,
    Inject,
    Optional,
    ElementRef,
    Directive,
    Input
} from '@angular/core';
import { TranslatePipe, TranslateService, TranslateDirective } from '@ngx-translate/core';

export const TRANSLATE_TOKEN = new InjectionToken('MyTranslateToken');
// tslint:disable-next-line:variable-name
const app_annotations_key = '__app_annotations__';

export function Localization(path: string) {
    // tslint:disable-next-line:only-arrow-functions
    return function (target: Function) {
        const metaKey = app_annotations_key;
        Object.defineProperty(target, metaKey, {
            value: {
                path,
                name: 'Translate'
            }
        } as PropertyDescriptor);
    };
}

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[myTranslate]'
})
export class MyTranslateDirective extends TranslateDirective {

    @Input()
    public set myTranslate(e: string) {
        this.translate = e;
    }
    private keyPath: string;

    constructor(private _translateService: TranslateService,
                private _element: ElementRef,
                _chRef: ChangeDetectorRef,
                @Inject(TRANSLATE_TOKEN) @Optional() protected cmp: Object) {
        super(_translateService, _element, _chRef);
        const prototype = Object.getPrototypeOf(cmp || {}).constructor;
        if (prototype[app_annotations_key]) {
            this.keyPath = prototype[app_annotations_key].path;
        }
    }

    public updateValue(key: string, node: any, translations: any) {
        if (this.keyPath) {
            key = `${this.keyPath.replace(/\//, '.')}.${key}`;
        }
        super.updateValue(key, node, translations);
    }
}

// tslint:disable-next-line:max-classes-per-file
@Pipe({
  name: 'myTranslate'
})
export class MyTranslatePipe extends TranslatePipe implements PipeTransform {

    private keyPath: string;

    public constructor(private _translate: TranslateService,
                       private _chRef: ChangeDetectorRef,
                       private _injector: Injector,
                       @Inject(TRANSLATE_TOKEN) @Optional() protected cmp: Object) {
        super(_translate, _chRef);
        const prototype = Object.getPrototypeOf(cmp || {}).constructor;
        if (prototype[app_annotations_key]) {
            this.keyPath = prototype[app_annotations_key].path;
        }
    }

    public updateValue(key: string, node: any, translations: any) {
        if (this.keyPath) {
            key = `${this.keyPath.replace(/\//, '.')}.${key}`;
        }
        super.updateValue(key, node, translations);
    }
}
