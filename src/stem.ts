import { LanguageCode } from './types.js'
import { Stemmer, newStemmer } from 'snowball-stemmers'
import { getLanguage } from './language.js'

const stemmersCache = new Map<string, Stemmer>()

const getStemmer = async (languageCode: LanguageCode): Promise<Stemmer> => {
    if (!stemmersCache.has(languageCode)) {
        const language = await getLanguage(languageCode)
        stemmersCache.set(languageCode, newStemmer(language['stem-library']))
    }

    return stemmersCache.get(languageCode)!
}

export const stemWord = async (word: string, languageCode: LanguageCode): Promise<string> => {
    const stemmer = await getStemmer(languageCode)
    return stemmer.stem(word)
}
