import { LanguageCode } from './types.js'
import { getSearchWebsites } from './search.js'
import { getWebsiteText } from './scrape.js'
import { removeStopWords } from './stopword.js'
import { stemWord } from './stem.js'

const searchWordLimit = 32 as const

const shingleWords = (words: string[], shingleSize: number): string[] => {
    const shingledWords: string[] = []
    for (let i = 0; i < words.length - shingleSize + 1; i++) {
        const shingle = words.slice(i, i + shingleSize).join(' ')
        shingledWords.push(shingle)
    }
    return shingledWords
}

const clusterizeShingleWords = (
    shingledWords1: string[],
    shingledWords2: string[],
    maxGap: number,
    minClusterSize: number,
): Array<Array<[number, number]>> => {
    const clustersIndexes: Array<Array<[number, number]>> = []
    const matches: Array<[number, number]> = []

    for (let i = 0; i < shingledWords1.length; i++) {
        for (let j = 0; j < shingledWords2.length; j++) {
            if (shingledWords1[i] === shingledWords2[j]) {
                matches.push([i, j])
            }
        }
    }

    for (const match of matches) {
        let found = false
        for (const cluster of clustersIndexes) {
            for (const clusterItem of cluster) {
                if (
                    Math.abs(match[0] - clusterItem[0]) <= maxGap &&
                    Math.abs(match[1] - clusterItem[1]) <= maxGap
                ) {
                    cluster.push(match)
                    found = true
                    break
                }
            }
        }

        if (!found) {
            clustersIndexes.push([match])
        }
    }

    return clustersIndexes.filter((cluster) => cluster.length >= minClusterSize)
}

const getClusterPlagiarismScore = (cluster: Array<[number, number]>): number => {
    let inputShingleStart = cluster[0][0]
    let inputShingleEnd = cluster[0][0]

    for (let i = 1; i < cluster.length; i++) {
        if (cluster[i][0] < inputShingleStart) {
            inputShingleStart = cluster[i][0]
        } else if (cluster[i][0] > inputShingleEnd) {
            inputShingleEnd = cluster[i][0]
        }
    }

    if (inputShingleEnd - inputShingleStart > 1) {
        return Math.pow(cluster.length, 2) / (inputShingleEnd - inputShingleStart)
    } else {
        return 0
    }
}

const getWordTokens = (text: string): string[] => {
    return text.replace(/[^a-z0-9\s]/gi, '').split(/\s+/g)
}

export const getPlagiarismScore = async ({
    text,
    languageCode,
    googleApiKey,
    googleEngineId,
    shingleSize = 3,
    maxGap = 3,
    minClusterSize = 1,
}: {
    text: string
    languageCode: LanguageCode
    googleApiKey: string
    googleEngineId: string
    shingleSize: number
    maxGap: number
    minClusterSize: number
}): Promise<number> => {
    const wordTokens = getWordTokens(text)
    const words = await removeStopWords(wordTokens, languageCode)

    const stemmedWords = await Promise.all(words.map((word) => stemWord(word, languageCode)))
    const shingledWords = shingleWords(stemmedWords, shingleSize)

    const queries = []
    for (let i = 0; i < Math.ceil(words.length / searchWordLimit); i++) {
        queries.push(words.slice(i * searchWordLimit, (i + 1) * searchWordLimit).join(' '))
    }

    const queryScores: number[] = []
    const usedUrls = new Set<string>()
    for (const query of queries) {
        const websites = await getSearchWebsites(query, googleApiKey, googleEngineId)
        const newUrls = websites.filter((url) => !usedUrls.has(url))

        const queryClusters = []
        const websiteTexts = await Promise.all(newUrls.map((url) => getWebsiteText(url)))
        for (const websiteText of websiteTexts) {
            const websiteWordsToken = getWordTokens(websiteText)
            const websiteWords = await removeStopWords(websiteWordsToken, languageCode)

            const websiteStemmedWords = await Promise.all(
                websiteWords.map((word) => stemWord(word, languageCode)),
            )
            const shingledWebsiteWords = shingleWords(websiteStemmedWords, shingleSize)

            const clusters = clusterizeShingleWords(
                shingledWords,
                shingledWebsiteWords,
                maxGap,
                minClusterSize,
            )
            queryClusters.push(...clusters)
        }

        const greaterScore = queryClusters.reduce(
            (currentGreaterScore, cluster) =>
                Math.max(currentGreaterScore, getClusterPlagiarismScore(cluster)),
            0,
        )
        queryScores.push(greaterScore)

        newUrls.forEach((url) => usedUrls.add(url))
    }

    const averageScore = queryScores.reduce((sum, score) => sum + score, 0) / queryScores.length
    const normalizedScore = averageScore / words.length

    return normalizedScore
}
