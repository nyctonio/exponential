export default function validateUsername(username: string) {
  let exp = new RegExp('^[a-zA-Z0-9]+$');
  let res = exp.test(username);
  console.log('res is ', res);
  if (!res) {
    return {
      status: false,
      message: 'Username can only contain alphanumeric characters',
    };
  }
  return { status: true, message: 'Valid Username' };
}
