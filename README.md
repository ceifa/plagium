# Plagium

A package to get a plagiarism score from documents.

# API Usage

```js
import { getPlagiarismScore } from 'plagium'

// Will return a number between 0 and 1
const score: number = await getPlagiarismScore({
    text, // The document text to be checked
    languageCode, // pt-BR it's the only available right now
    googleApiKey, // Google API key
    googleEngineId, // Google engine Id
})
```
