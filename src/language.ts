import { LanguageCode } from './types'
import { URL } from 'url'
import { readFile } from 'fs/promises'
import type language from './languages.json'

let cachedLanguages: typeof language | undefined = undefined

export const getLanguage = async (
    languageCode: LanguageCode,
): Promise<typeof language[LanguageCode]> => {
    if (cachedLanguages === undefined) {
        cachedLanguages = JSON.parse(
            await readFile(new URL('./languages.json', import.meta.url), 'utf8'),
        )
    }

    return cachedLanguages![languageCode]
}
