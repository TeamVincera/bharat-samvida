export const clamp = (n:number) => Math.max(0,Math.min(1,n));
export const smooth = (n:number) => {const x=clamp(n);return x*x*(3-2*x);};
/** One reversible, scroll-owned timeline. Nothing advances on a timer. */
export function journeyAt(progress:number) {
  const position=clamp(progress)*3;
  const chapter=Math.min(2,Math.floor(position));
  const local=position===3?1:position-chapter;
  const flight=chapter<2?smooth((local-.82)/.18):0;
  const renovation=clamp((local-.12)/.68);
  return {chapter,local,flight,renovation,stage:renovation<.28?0:renovation<.75?1:2};
}
