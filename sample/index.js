import { getPlagiarismScore } from '../dist/index.js';

const score = await getPlagiarismScore({
    languageCode: 'pt-BR',
    text: `Capitalismo é um sistema econômico baseado na propriedade privada dos meios de produção e sua operação com fins lucrativos. As características centrais deste sistema incluem, além da propriedade privada, a acumulação de capital, o trabalho assalariado, a troca voluntária, um sistema de preços e mercados competitivos. `,
    googleApiKey: process.env.GOOGLE_API_KEY,
    googleEngineId: process.env.GOOGLE_ENGINE_ID,
})

console.log(score)
