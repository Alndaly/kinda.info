import { spawn } from 'cross-spawn'
import fs from 'fs-extra'
import { dirname } from 'path'
import { siteConfig } from '../../site.config'

const cache = new Map<string, number>()

export const getGitFileCreateTimestamp = async (file: string) => {
    file = process.cwd() + '/' + siteConfig.docPath + "/" + file
    const cached = cache.get('createTimeFor:' + file)
    if (cached) return cached

    return new Promise<number>((resolve, reject) => {
        const cwd = dirname(file)
        if (!fs.existsSync(cwd)) return resolve(0)

        const subprocess = spawn('git', ['log', '--follow', '--pretty="%ai"', '--date', 'default', file]);

        let output = ''
        subprocess.stdout.on('data', (data) => {
            output += String(data)
        });
        subprocess.stdout.on('close', () => {
            // convert the output to string
            const gitOutput = output.trim();
            // split the output by line
            const lines = gitOutput.split('\n');
            // get the last line
            const lastLine = lines[lines.length - 1];
            const timestamp = +new Date(lastLine)
            cache.set('createTimeFor:' + file, timestamp)
            resolve(timestamp)
        });
        subprocess.on('error', reject)
    })
}

export const getGitFileUpdateTimestamp = async (file: string) => {
    file = process.cwd() + '/' + siteConfig.docPath + "/" + file
    const cached = cache.get('updateTimeFor:' + file)
    if (cached) return cached

    return new Promise<number>((resolve, reject) => {
        const cwd = dirname(file)
        if (!fs.existsSync(cwd)) return resolve(0)

        const subprocess = spawn('git', ['log', '-1', '--pretty="%ai"', file]);

        let output = ''
        subprocess.stdout.on('data', (data) => {
            output += String(data)
        });
        subprocess.stdout.on('close', () => {
            const timestamp = +new Date(output)
            cache.set('updateTimeFor:' + file, timestamp)
            resolve(timestamp)
        });
        subprocess.on('error', reject)
    })
}