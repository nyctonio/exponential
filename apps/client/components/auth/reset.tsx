import { useState } from 'react';
import Quotes from './quotes';
import { LoginInput } from '../inputs/text';
import { PrimaryButton } from '../inputs/button';
import { useRouter } from 'next/navigation';
import Toast from '@/utils/common/toast';
import axios from 'axios';
import Routes from '@/utils/routes';

function Index({ username, token }: { username: string; token: string }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    retypePassword: '',
  });
  console.log('token', token);

  const router = useRouter();

  const submitHandler = async () => {
    let toast = new Toast('Resetting Password');

    if (formData.newPassword != formData.retypePassword) {
      toast.error('New Password and Retype Passwords do not match.');
      return;
    }

    try {
      let resetuserresponse = await axios({
        method: Routes.RESET_PASSWORD.method.type,
        url: `${process.env.NEXT_PUBLIC_BACKEND}${Routes.RESET_PASSWORD.url}`,
        data: {
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (resetuserresponse.data.status) {
        toast.success('Password Reset Successfully');
        router.replace('/login');
      } else {
        toast.error(resetuserresponse.data.message);
      }
      return;
    } catch (e: any) {
      toast.error('Something went wrong');
      return;
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
        <div className="bg-[var(--light)] rounded-2xl h-[50vh] md:h-[50vh] shadow-xl w-[80vw] md:w-[30vw] py-[55px] px-6 flex flex-col justify-around">
          <div className="header text-center flex flex-col">
            <div className="font-bold text-xl">Hello Welcome!</div>
            <div className="text-[#757575] text-sm font-light">
              Please fill these details to reset your password.
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitHandler();
            }}
            className="space-y-[40px]"
          >
            <div className="form flex flex-col justify-around space-y-4">
              <div className="flex flex-col space-y-1">
                <label
                  htmlFor="expo_old_password"
                  className="text-[#696F8C] text-xs font-[400]"
                >
                  Old Password
                </label>
                <LoginInput
                  id="expo_old_password"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => {
                    setFormData((formData) => {
                      return { ...formData, currentPassword: e.target.value };
                    });
                  }}
                  placeholder="Enter Old Password"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label
                  htmlFor="expo_new_password"
                  className="text-[#696F8C] text-xs font-[400]"
                >
                  Password
                </label>
                <LoginInput
                  autoComplete="off"
                  id="expo_new_password"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => {
                    setFormData((formData) => {
                      return { ...formData, newPassword: e.target.value };
                    });
                  }}
                  placeholder="Enter New Password"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label
                  htmlFor="expo_retype_password"
                  className="text-[#696F8C] text-xs font-[400]"
                >
                  Confirm Password
                </label>
                <LoginInput
                  id="expo_retype_password"
                  type="password"
                  value={formData.retypePassword}
                  onChange={(e) => {
                    setFormData((formData) => {
                      return { ...formData, retypePassword: e.target.value };
                    });
                  }}
                  placeholder="Confirm New Password"
                />
              </div>
            </div>
            <div className="button">
              <PrimaryButton className="text-center w-[100%] text-sm">
                Update
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
