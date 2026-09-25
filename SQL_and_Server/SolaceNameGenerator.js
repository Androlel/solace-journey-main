const language = "aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ"
const min = 1
const max = 200
const diff = max - min

export default function generateName() {
    const nameLength = Math.floor(Math.random() * diff + min)
    let name = ""
    for (let i = 0; i < nameLength; i++)
        name = name + language[Math.floor(Math.random() * language.length)]
    return name
}