import hindi from '@/data/ui-hi.json';
import type {Locale} from './i18n';
const dictionary:Record<string,string>=hindi;
const phrases=Object.entries(dictionary).filter(([key])=>key.length>=8 || ['Role: ', 'Corpus: ', '[OPEN] '].includes(key)).sort((a,b)=>b[0].length-a[0].length);
export function translateText(locale:Locale,value:string):string {
  if(locale!=='hi'||!value)return value;
  if(dictionary[value])return dictionary[value];
  const trimmed=value.trim();
  if(dictionary[trimmed])return value.replace(trimmed,dictionary[trimmed]);
  const quantity=trimmed.match(/^How much of “(.+)” is required\?$/);
  if(quantity)return `“${quantity[1]}” की कितनी मात्रा चाहिए?`;
  const performance=trimmed.match(/^What measurable technical requirements apply to “(.+)”\?$/);
  if(performance)return `“${performance[1]}” के लिए कौन-सी मापने योग्य तकनीकी आवश्यकताएँ हैं?`;
  if(trimmed.endsWith(': quantity and unit'))return trimmed.replace(': quantity and unit',': मात्रा और इकाई');
  if(trimmed.endsWith(': measurable technical requirements'))return trimmed.replace(': measurable technical requirements',': मापने योग्य तकनीकी आवश्यकताएँ');
  return value;
}
/** Local dictionary only: exporting a draft never sends it to another service. */
export function translateDocumentText(locale:Locale,value:string):string {
  if(locale!=='hi')return value;
  const direct=translateText(locale,value);if(direct!==value)return direct;
  let text=value;
  for(const [source,target] of phrases)if(text.includes(source))text=text.replaceAll(source,target);
  return text;
}
