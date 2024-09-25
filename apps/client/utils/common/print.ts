const debug = process.env.NODE_ENV !== 'production';
const debug_Type = 'ALL';
export default function printSafe(
  data: any,
  type?: 'API' | 'UTIL' | 'LOG' | 'PAGE' | 'OTHER'
) {
  if (debug) {
    data.map((items: any) => {
      if (debug_Type === 'ALL') {
        console.log(items);
      } else {
        if (type === debug_Type) {
          console.log(items);
        }
      }
    });
  }
}
