import * as cheerio from 'cheerio'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import yargs from 'yargs/yargs'

// Define CLI arguments config
const argv = yargs(process.argv.slice(2))
  .option('url', {
    alias: 'u',
    describe: 'URL resource to process',
    demandOption: true,
    requiresArg: true,
    type: 'string'
  })
  .alias({ h: 'help' })
  .help()
  .version()
  .argv

// Fetch the page HTML
const resp = await fetch(argv.url, {
  method: 'GET'
}).then(r => r.text())

// Extract just the content
const $ = cheerio.load(resp)
$('.entry-content .page_hierarchy').remove()
const content = $('.entry-content').html()
const title = $('h1.entry-title')?.text()

// Convert to Markdown
const turndown = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '*',
  codeBlockStyle: 'fenced',
  emDelimiter: '*'
})
turndown.use(gfm)
turndown.addRule('basicPre', {
  filter: ['pre'],
  replacement (c) {
    return '```\n' + c + '\n```'
  }
})

let result = turndown.turndown(content)
if (title) {
  result = `# ${title}\n\n${result}`
}

console.info(result)