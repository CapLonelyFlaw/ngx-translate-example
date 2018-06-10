import {
    Injectable, ErrorHandler, Injector
} from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { TranslateService,
        MissingTranslationHandler,
        MissingTranslationHandlerParams,
        TranslateCompiler } from '@ngx-translate/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/finally';

// import 'moment/locale/en-gb';
// import 'moment/locale/ru';

import { Subscription } from 'rxjs/Subscription';

// tslint:disable-next-line:max-classes-per-file
@Injectable()
// TODO: additionalStorageKey is useless now, but if we load translations depends on current user
// we can store userId at that field and load new translation with router resolve property
export class AppTranslateLoader {

    public additionalStorageKey = '';

    private translationsDir: string;
    private translationsConfig: string;

    private selectedLang: string;
    private fallbackLang: string;
    private loadedLang: string;
    private config: { [key: string]: string; } = null;

    private loadSubs = new Subscription();
    private configSubs = new Subscription();
    private loadSubj = new Subject();

    private get storageKey(): string {
        return this.additionalStorageKey ?
            `APP_LANG_${this.additionalStorageKey}` : 'APP_LANG';
    }

    constructor(private http: HttpClient,
                private translate: TranslateService) {
        this.translationsDir = `${process.env.TRANSLATE_OUTPUT}`;
        this.translationsConfig = `${process.env.TRANSLATE_CONFIG}`;
        this.fallbackLang = 'en';

        const storedLang = this.getUsedLanguage();
        if (storedLang) {
            this.selectedLang = storedLang;
        } else {
            this.selectedLang = translate.getBrowserLang() || this.fallbackLang;
        }
    }

    public getUsedLanguage() {
        return localStorage.getItem(this.storageKey);
    }

    public loadTranslation(lang: string = ''): Promise<any> {
        if (!lang) { lang = this.selectedLang; }
        if (lang === this.loadedLang) { return; }
        if (!this.config) {
            this.configSubs.unsubscribe();
            this.configSubs = this.http.get<Response>(`${this.translationsDir}${this.translationsConfig}`)
                .subscribe((config: any) => {
                    this.config = config;
                    this.loadAndUseLang(lang);
                });
        } else {
            this.loadAndUseLang(lang);
        }
        return this.loadSubj.asObservable().toPromise();
    }

    private loadAndUseLang(lang: string) {
        this.loadSubs.unsubscribe();
        this.loadSubs = this.http.get<Response>(`${this.translationsDir}${this.config[lang] || this.config[this.fallbackLang]}`)
            .subscribe(res => {
                this.translate.setTranslation(lang, res);
                this.translate.use(lang).subscribe(() => {
                    this.onLangLoaded(lang);
                }, (err) => this.onLoadLangError(lang, err));
            }, (err) => this.onLoadLangError(lang, err));
    }

    private onLangLoaded(newLang: string) {
        // remove previous loaded language
        if (this.loadedLang && this.loadedLang !== newLang) {
            this.translate.resetLang(this.loadedLang);
        }
        this.loadedLang = newLang;
        this.selectedLang = newLang;
        // TODO: need to log error on build time
        // momentJs additional *.js files is included separately
        // because including all locales will increase build size
        // we can log error on build time, and check included locales depend on
        // ngx-translate *.json translation files list
        // moment().locale(newLang);
        localStorage.setItem(this.storageKey, newLang);
        this.loadSubj.complete();
    }

    private onLoadLangError(langKey: string, error: any) {
        if (this.loadedLang) {
            this.translate.use(this.loadedLang)
                .subscribe(() => this.onLangLoaded(this.loadedLang), (err) => this.loadSubj.error(err));
        } else if (langKey !== this.fallbackLang) {
            this.loadAndUseLang(this.fallbackLang);
        } else {
            this.loadSubj.error(error);
        }
    }
}
