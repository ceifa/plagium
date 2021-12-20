import { LanguageCode } from './types.js'
import { getLanguage } from './language.js'
import stopword from 'stopword'

export const removeStopWords = async (
    words: string[],
    languageCode: LanguageCode,
): Promise<string[]> => {
    const language = await getLanguage(languageCode)
    return stopword.removeStopwords(words, [language['stopword-library']])
}
