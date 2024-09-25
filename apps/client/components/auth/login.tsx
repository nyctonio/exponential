import Quotes from './quotes';
import { LoginInput } from '../inputs/text';
import { PrimaryButton } from '../inputs/button';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';
import { useUserStore } from '@/store/user';
import Toast from '@/utils/common/toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import printSafe from '@/utils/common/print';
import { ResponseType } from '@/types/backend/type';
import useRedirectOnLogin from '@/hooks/useRedirectOnLogin';
import axios from 'axios';

function Index() {
  const { apiCall } = useFetch();
  const { setUser, setMenus } = useUserStore();
  const [login, setLogin] = useState({
    username: '',
    password: '',
  });
  const router = useRouter();
  const { redirectOnLogin } = useRedirectOnLogin();

  const loginHandler = async () => {
    let toast = new Toast('Verifying Credentials!!');
    const logindata = await apiCall(Routes.LOGIN, login, false);
    printSafe([logindata]);
    if (logindata.type == ResponseType.RESET_REQUIRED) {
      toast.success(logindata.message);
      router.replace(
        `/reset-password?username=${login.username}&token=${logindata.data.token}`
      );
    } else if (!logindata.status) {
      toast.error(logindata.message);
    } else {
      // fetch users menu data
      const _menudata = await axios({
        url: `${process.env.NEXT_PUBLIC_BACKEND}${Routes.GET_USER_MENUS.url}`,
        method: Routes.GET_USER_MENUS.method.type,
        headers: {
          Authorization: `Bearer ${logindata.data.token}`,
        },
      });
      const menudata = _menudata.data;
      // const menudata = await apiCall(Routes.GET_USER_MENUS, {}, false);
      if (menudata.status) {
        menudata.data = menudata.data.map((menu: any) => {
          menu.subMenus = menu.subMenus.map((submenu: any) => {
            return {
              ...submenu,
              subMenuUrl: `${menu.menuConstantText}/${submenu.subMenuConstantText}`,
            };
          });
          return {
            ...menu,
            menuUrl: menu.menuConstantText,
          };
        });
        setUser({
          id: logindata.data.user.id,
          email: logindata.data.user.email,
          token: logindata.data.token,
          userName: logindata.data.user.username,
          userType: {
            id: logindata.data.user.userType.userTypeId,
            name: logindata.data.user.userType.name,
            constant: logindata.data.user.userType.constant,
          },
        });
        setMenus(menudata.data);
        toast.success(logindata.message);
        redirectOnLogin(logindata.data.user.userType.constant, menudata.data);
      } else {
        toast.error(menudata.message);
      }
    }
  };

  return (
    <div className="min-h-screen w-screen">
      <div className="bg-[#2C5743]">
        <img
          src={'assets/login.svg'}
          style={{
            width: '100%',
            objectPosition: 'center',
            objectFit: 'cover',
            height: '37vh',
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '0',
        }}
        className="flex flex-col md:flex-row justify-center md:justify-between px-[20vw] items-center space-x-[5vw] h-screen w-screen"
      >
        <div className="bg-[var(--light)] rounded-2xl h-[45vh] shadow-xl w-[80vw] md:w-[30vw] py-[50px] px-6 flex flex-col justify-around space-y-2">
          <div className="header text-center flex flex-col">
            <div className="font-bold text-xl">Hello Welcome!</div>
            <div className="text-[#757575] text-sm font-light">
              Please enter your login details to Login.
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loginHandler();
            }}
            className="space-y-4"
          >
            <div className="form flex flex-col justify-around space-y-4">
              <div className="flex flex-col space-y-1">
                <label htmlFor="" className="text-[#696F8C] text-xs font-[400]">
                  Username
                </label>
                <LoginInput
                  value={login.username}
                  onChange={(e) =>
                    setLogin((_login) => {
                      return { ..._login, username: e.target.value };
                    })
                  }
                  placeholder="Enter your username"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label htmlFor="" className="text-[#696F8C] text-xs font-[400]">
                  Password
                </label>
                <LoginInput
                  value={login.password}
                  onChange={(e) =>
                    setLogin((_login) => {
                      return { ..._login, password: e.target.value };
                    })
                  }
                  type="password"
                  placeholder="Enter Password"
                />
              </div>

              <div className="login-checkbox space-x-1 flex flex-row items-center">
                <input
                  defaultChecked={true}
                  // checked={true}
                  style={{}}
                  type="checkbox"
                  className=" accent-[#52BD92]"
                ></input>
                <span className="text-[#1D3C2F] text-sm">
                  Keep me logged in
                </span>
              </div>
            </div>
            <div className="button">
              <PrimaryButton
                type="submit"
                className="text-center w-[100%] text-sm"
              >
                Login
              </PrimaryButton>
            </div>
          </form>
        </div>
        <div className="hidden md:flex flex-col justify-end h-[40vh] text-[#1D3C2F] w-[30vw]">
          <Quotes />
        </div>
      </div>
    </div>
  );
}

export default Index;
