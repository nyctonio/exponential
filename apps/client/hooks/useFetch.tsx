import axios from 'axios';
import { ResponseType } from '@/types/backend/type';
import { useRouter } from 'next/navigation';
import Toast from '@/utils/common/toast';
import printSafe from '@/utils/common/print';
import { useUserStore } from '@/store/user';

const useFetch = () => {
  const router = useRouter();
  const { user } = useUserStore();

  const apiCall = async (
    _data: {
      url: string;
      method: {
        type: string;
        validation: any;
      };
    },
    body: any,
    printToast: boolean = true
  ) => {
    console.log('🚀 ~ useFetch', _data.url);
    // printSafe(
    //   [
    //     '🚀 useFetch',
    //     'url',
    //     _data.url,
    //     'method',
    //     _data.method,
    //     'body',
    //     body,
    //     'printToast',
    //     printToast,
    //   ],
    //   'API'
    // );
    let auth_token = user?.token;
    // @ts-ignore
    let v = _data.method.validation;
    if (v) {
      const { error } = v.validate(body);
      if (error) {
        printSafe(['🚀 validation error in route', _data.url, error]);
        if (printToast) {
          new Toast(error.message).error(error.message);
        }
        return {
          status: false,
          type: ResponseType.CLIENT_ERROR,
          message: `Validation Error ${error.message}`,
        };
      }
    }
    try {
      const {
        data,
      }: {
        data: {
          data: any;
          status: boolean;
          type: string;
          message: string;
        };
      } = await axios({
        method: _data.method.type,
        url: `${process.env.NEXT_PUBLIC_BACKEND}${_data.url}`,
        data: body,
        headers: {
          Authorization: `Bearer ${auth_token}`,
        },
      });
      if (
        data.type === ResponseType.UNAUTHORISED ||
        data.type === ResponseType.TOKEN_EXPIRED ||
        data.type === ResponseType.MULTIPLE_LOGIN
      ) {
        console.log('🚀 ~ unauthorised', _data.url);
        if (printToast) {
          new Toast(data.message).error(data.message);
        }
        localStorage.clear();
        sessionStorage.clear();
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
      if (
        !data.status &&
        data.type !== ResponseType.UNAUTHORISED &&
        data.type !== ResponseType.TOKEN_EXPIRED &&
        data.type !== ResponseType.MULTIPLE_LOGIN
      ) {
        if (printToast) {
          new Toast(data.message).error(data.message);
        }
      }
      return {
        status: data.status,
        type: data.type,
        message: data.message,
        data: data.data,
      };
    } catch (error) {
      printSafe(['🚀 error in route', _data.url, error]);
      // @ts-ignore
      new Toast('Something went wrong').error(`${error.message}`);
      return {
        status: false,
        type: ResponseType.CLIENT_ERROR,
        message: 'Something went wrong',
      };
    }
  };

  return { apiCall };
};

export default useFetch;
