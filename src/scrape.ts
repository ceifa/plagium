import fetch from 'node-fetch'

export const getWebsiteText = async (url: string): Promise<string> => {
    const controller = new AbortController()
    const timeout = setTimeout(() => {
        controller.abort()
    }, 10000)

    try {
        const fetchResult = await fetch(url, {
            headers: {
                'user-agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ' +
                    'AppleWebKit/537.36 (KHTML, like Gecko) ' +
                    'Chrome/83.0.4103.97 Safari/537.36',
                'connection': 'keep-alive',
            },
            signal: controller.signal,
        })
        const html = await fetchResult.text()
        return html
            .replace(/<style([\s\S]*?)<\/style>/gi, '')
            .replace(/<script([\s\S]*?)<\/script>/gi, '')
            .replace(/<[^>]+>/gi, ' ')
    } catch {
        return ''
    } finally {
        clearTimeout(timeout)
    }
}
