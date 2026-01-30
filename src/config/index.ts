import {AppConfigType} from './app.config';
import {DbConfigType} from './db.config';
import {TgConfigType} from './tg.config';
import {I18nConfigType} from './i18n.config';

export interface AllConfigType {
    app: AppConfigType;
    db: DbConfigType;
    tg: TgConfigType;
    i18n: I18nConfigType;
}

// Validation Schema
export * from './validation.config';

// Individual Configs
export * from './app.config';
export * from './db.config';
export * from './tg.config';
export * from './i18n.config';

