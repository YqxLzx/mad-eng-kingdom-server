import axios from "axios"
const path = require('path');
const fs = require('fs').promises; // 使用fs的promises API进行异步操作  
const DIT_PATH = 'https://api.dictionaryapi.dev/api/v2/entries/en/'

async function readJsonFile(relativePath) {
    // 假设fileName是文件名，不包括路径，且文件位于项目根目录  
    const filePath = path.resolve(__dirname, '..', '..', relativePath); // 向上两层目录，然后到words_dictionary.json  

    try {
        // 读取文件内容  
        const data = await fs.readFile(filePath, 'utf8');

        // 解析JSON字符串为JavaScript对象  
        const parsedData = JSON.parse(data);
        return parsedData;

    } catch (error) {
        console.error(`Error reading file: ${error.message}`);
        return {}
    }
}

// 调用函数，传入你的JSON文件名（不包括路径）  
readJsonFile('words_dictionary.json');




export async function getWords() {
    // 调用函数，传入你的JSON文件路径  
    const parsedData = await readJsonFile('words_dictionary.json');
    let index = 0;
    let keys: string[] = []
    for (let key in parsedData) {
        if (index === 10) {
            break
        }
        keys.push(key)
        index++;
    }
    let i = 0;
    const loopGetWord = setInterval(() => {
        axios.get(`${DIT_PATH}${keys[i]}`).then(res => {
            console.log('word:', res.data)
        }).catch(err => {
            console.log('err-wrong')
        })
        i++
        if (i === 10) {
            keys = []
            console.log('over')
            clearInterval(loopGetWord)
        }
    }, 1000 * 15)

}
