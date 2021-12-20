import fetch from 'node-fetch'

export const getSearchWebsites = async (
    query: string,
    googleApiKey: string,
    googleEngineId: string,
): Promise<string[]> => {
    const searchParams = new URLSearchParams({
        q: query,
        key: googleApiKey,
        cx: googleEngineId,
        num: '10',
    })

    const fetchResult = await fetch(`https://www.googleapis.com/customsearch/v1?${searchParams}`)
    const response = await fetchResult.json()

    if (response && typeof response === 'object') {
        const errorResult = response as
            | { items: Array<{ link: string }>; error: undefined }
            | { error: { message: string }; items: undefined }

        if (errorResult.error) {
            throw new Error(errorResult.error.message)
        } else {
            return errorResult.items?.map((item) => item.link) ?? []
        }
    }

    return []
}
