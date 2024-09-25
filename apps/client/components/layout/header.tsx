'use client';
import { Layout, Modal, Tabs, message, notification } from 'antd';
import { useUserStore } from '@/store/user';
import { Tooltip, Dropdown, Space } from 'antd';
import type { MenuProps } from 'antd';
import Statement from '@/components/trade/perform-trades/statement';
import NotificationsComponent from '../notification';
import { useEffect, useState } from 'react';
import { useNotifications } from '@/store/notification/notification';
import moment from 'moment';
import useFetch from '@/hooks/useFetch';
import Routes from '@/utils/routes';
import BroadCastListComponent from '../notification/broadcast';
import { useBroadCastMessages } from '@/store/notification/broadcast';
import { Noticia_Text } from 'next/font/google';
import { LoginInput } from '../inputs/text';
import { PrimaryButton } from '../inputs/button';
import Toast from '@/utils/common/toast';
import Joi from 'joi';

const { Header } = Layout;

const Index = () => {
  const { apiCall } = useFetch();
  const { user, setUser } = useUserStore();
  const { notifications, setNotifications } = useNotifications();
  const { messages, setMessages } = useBroadCastMessages();
  const [visible, setVisible] = useState(false);
  const [messageVisible, setMessageVisible] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    retypePassword: '',
  });

  const open = () => {
    setOpenModal(true);
  };

  const close = () => {
    setOpenModal(false);
  };

  const handleCheckboxChange = async (id: number) => {
    const res = await apiCall(Routes.NOTIFICATION.CHECK_NOTIFICATION, {
      id: id,
    });
    if (res.status) {
      setNotifications(
        notifications.map((n) => {
          return n.id === id ? { ...n, read: true } : n;
        })
      );
      console.log(res.data);
    }
  };

  const handleMessageSeen = async (id: number) => {
    const res = await apiCall(Routes.NOTIFICATION.CHECK_MESSAGE, {
      id: id,
    });
    if (res.status) {
      setMessages(
        messages.map((m) => {
          return m.id === id ? { ...m, read: true } : m;
        })
      );
      console.log(res.data);
    }
  };

  const items: MenuProps['items'] = [
    {
      label: (
        <div
          onClick={() => {
            setUser(null);
            localStorage.clear();
            sessionStorage.clear();
          }}
          className="text-[15px] hover:cursor-pointer hover:text-[var(--primary-shade-b)] flex justify-center items-center"
        >
          Sign Out
        </div>
      ),
      key: '0',
    },
    {
      label: (
        <div
          onClick={open}
          className="text-[15px] hover:cursor-pointer hover:text-[var(--primary-shade-b)] flex justify-center items-center"
        >
          Reset Password
        </div>
      ),
      key: '1',
    },
  ];

  const submitHandler = async (e: any) => {
    e.preventDefault();
    let toast = new Toast('Resetting Password');
    if (formData.newPassword != formData.retypePassword) {
      toast.error('New Password and Retype Passwords do not match.');
      return;
    }
    try {
      let res = await apiCall(
        {
          method: {
            type: Routes.RESET_PASSWORD.method.type,
            validation: Joi.any(),
          },
          url: Routes.RESET_PASSWORD.url,
        },
        {
          oldPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }
      );
      if (res.status) {
        toast.success('Password Reset Successfully');
        setFormData({
          currentPassword: '',
          newPassword: '',
          retypePassword: '',
        });
        close();
      } else {
        toast.error(res.data);
        return;
      }
    } catch (e: any) {
      return;
    }
  };

  let notificationsCount = notifications?.filter((_n) => {
    return _n.read == false;
  }).length;

  let messagesCount = messages?.filter((_m) => {
    return _m.read == false;
  }).length;
  const notificationsAndMessages: MenuProps['items'] = [
    {
      label: (
        <Tabs
          defaultActiveKey="1"
          items={[
            { name: 'Notifications', items: notifications },
            { name: 'Messages', items: messages },
          ].map((item, i) => {
            const id = String(i + 1);
            return {
              key: id,
              label: (
                <p className="flex space-x-3">
                  <span>{item.name}</span>
                  <span>
                    (
                    {item.name === 'Notifications'
                      ? notificationsCount
                      : messagesCount}
                    )
                  </span>
                </p>
              ),
              children: item.items?.map((_n) => {
                return (
                  <div
                    className={`py-1 px-3 shadow-sm border-b-[1px] border-gray-200 overflow-y-auto ${
                      !_n.read && 'bg-gray-100 hover:bg-gray-50'
                    }`}
                    key={_n.id}
                  >
                    <div
                      className={`flex justify-between ${!_n.read && 'mb-3'}`}
                    >
                      <p
                        className={`text-base capitalize font-semibold text-[var(--primary-shade-b)] flex justify-center items-center`}
                      >
                        {!_n.read && (
                          <span className="text-[var(--primary-shade-a)] w-5 h-5 text-3xl text-center flex justify-center items-center">
                            &#8226;
                          </span>
                        )}
                        <span>{_n.title}</span>
                      </p>
                      {!_n.read && (
                        <button
                          onClick={() => {
                            if (item.name === 'Notifications') {
                              handleCheckboxChange(_n.id);
                            } else {
                              handleMessageSeen(_n.id);
                            }
                          }}
                          className="text-white px-2 rounded-sm "
                          title="Read message"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 48 48"
                            id="Eye"
                            height={20}
                            width={20}
                          >
                            <path fill="none" d="M0 0h48v48H0z"></path>
                            <path
                              d="M24 9C14 9 5.46 15.22 2 24c3.46 8.78 12 15 22 15 10.01 0 18.54-6.22 22-15-3.46-8.78-11.99-15-22-15zm0 25c-5.52 0-10-4.48-10-10s4.48-10 10-10 10 4.48 10 10-4.48 10-10 10zm0-16c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"
                              fill="#294a42"
                              className="color000000 svgShape"
                            ></path>
                          </svg>
                        </button>
                      )}
                    </div>
                    <p className="text-sm ">{_n.content}</p>
                    <p className="text-xs text-gray-400 mt-3">
                      {moment(_n.createdAt).fromNow()}{' '}
                    </p>
                  </div>
                );
              }),
            };
          })}
        />
      ),
      key: 1,
    },
  ];

  return (
    <Header className="bg-[#f5f5f5] h-[45px] md:h-[55px] px-4 text-[var(--light)] flex items-center justify-between ">
      {/* create a vertical line */}

      <div className="hidden md:block"></div>
      <div className="flex text-[var(--dark)] w-full md:w-auto justify-between md:justify-center items-center space-x-4">
        <div className="md:hidden flex flex-row justify-center items-center space-x-2">
          <div>
            <svg
              width="30"
              height="40"
              viewBox="0 0 400 332"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M193.5 332V101.5L21 2.00002C8.49999 -3.5 0.499992 7.00001 0.499992 14V209C0.499992 219 7.99999 224.5 11.5 226.5L193.5 332Z"
                fill="#698C7E"
              />
              <path
                d="M207 331.537V101.037L379.5 1.5369C392 -3.96312 400 6.53689 400 13.5369V208.537C400 218.537 392.5 224.037 389 226.037L207 331.537Z"
                fill="#1D3C2F"
              />
              <path
                d="M54.3748 119.954C52.5341 118.546 50.9421 117.512 48.9421 116.512C46.9421 115.512 14.9421 97.0121 14.9421 97.0121L14.9421 130.012L48.279 150.041C50.279 150.663 52.2629 150.85 54.1176 150.592C55.9723 150.333 57.6614 149.634 59.0885 148.534C60.5156 147.434 61.6528 145.955 62.435 144.181C63.2172 142.408 63.6293 140.374 63.6475 138.197C63.6658 136.019 63.29 133.741 62.5415 131.491C61.7931 129.241 60.6866 127.064 59.2854 125.085C57.8841 123.106 56.2155 121.362 54.3748 119.954Z"
                fill="white"
              />
              <path
                d="M246.098 268.892C242.098 267.692 241.764 264.392 242.098 262.892L266.098 152.892C269.298 147.292 274.764 147.892 277.098 148.892L309.598 171.892L338.098 81.8923L320.098 98.3923C318.098 99.8923 314.598 99.8923 312.098 97.3923C309.098 94.3923 310.769 90.6425 311.598 89.8923C322.098 80.3923 343.598 60.9923 345.598 59.3923C348.098 57.3923 349.598 56.3923 353.098 57.3923C355.898 58.1923 356.931 61.7256 357.098 63.3923L365.598 106.892C365.598 108.726 364.598 112.492 360.598 112.892C356.598 113.292 354.931 110.392 354.598 108.892L349.598 84.8923L318.598 181.892C314.598 187.392 309.431 185.726 307.098 184.392L276.098 162.892L253.598 265.392C252.764 267.059 250.098 270.092 246.098 268.892Z"
                fill="white"
              />
            </svg>
          </div>
        </div>
        <Modal
          title="Reset Password"
          open={openModal}
          onCancel={close}
          okButtonProps={{ style: { display: 'none' } }}
          cancelButtonProps={{ style: { display: 'none' } }}
          width={400}
        >
          <form onSubmit={submitHandler} className="space-y-5">
            <div className="form flex flex-col justify-around mt-4 space-y-2">
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
                  placeholder="Enter Old Password"
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      currentPassword: e.target.value,
                    });
                  }}
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label
                  htmlFor="expo_new_password"
                  className="text-[#696F8C] text-xs font-[400]"
                >
                  New Password
                </label>
                <LoginInput
                  autoComplete="off"
                  id="expo_new_password"
                  value={formData.newPassword}
                  type="password"
                  placeholder="Enter New Password"
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      newPassword: e.target.value,
                    });
                  }}
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
                  placeholder="Confirm New Password"
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      retypePassword: e.target.value,
                    });
                  }}
                />
              </div>
            </div>
            <div className="button flex justify-end">
              <PrimaryButton className="text-center w-fit text-sm">
                Update
              </PrimaryButton>
            </div>
          </form>
        </Modal>
        <div className="flex flex-row space-x-4">
          <NotificationsComponent />
          <BroadCastListComponent />
          <div className=" flex flex-col">
            <p className="font-semibold text-base">{user?.userName}</p>
            <p className="font-light text-[0.7rem] leading-[1]">
              {user?.userType.name}
            </p>
          </div>
          <Dropdown
            trigger={['click']}
            className="cursor-pointer"
            menu={{
              items: notificationsAndMessages,
              className:
                'h-[80vh]  overflow-y-auto w-80 md:w-96 hover:bg-white',
            }}
            open={visible}
            onOpenChange={() => setVisible((prev) => !prev)}
          >
            <div className="flex items-center">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M17.7772 18H6.22281C4.39443 18 3.35076 16.1609 4.44779 14.8721C4.93344 14.3016 5.23274 13.6249 5.31328 12.9153L5.76046 8.97519C6.0016 6.85063 7.58766 5.10719 9.73005 4.37366V4.26995C9.73005 3.01629 10.7463 2 12 2C13.2537 2 14.2699 3.01629 14.2699 4.26995V4.37366C16.4123 5.10719 17.9984 6.85063 18.2395 8.97519L18.6867 12.9153C18.7673 13.6249 19.0666 14.3016 19.5522 14.8721C20.6492 16.1609 19.6056 18 17.7772 18ZM14.9721 20.0715C14.5147 21.1992 13.3565 22 12 22C10.6435 22 9.48526 21.1992 9.02789 20.0715C9.00883 20.0245 9 19.974 9 19.9233C9 19.6895 9.18951 19.5 9.42329 19.5H14.5767C14.8105 19.5 15 19.6895 15 19.9233C15 19.974 14.9912 20.0245 14.9721 20.0715Z"
                  fill="#28303F"
                />
              </svg>{' '}
              {(messagesCount != 0 || notificationsCount != 0) && (
                <p className="relative text-sm text-[var(--primary-shade-b)]  bg-white px-1 rounded-full -top-2 -left-2 font-semibold -mr-2">
                  {messagesCount + notificationsCount}
                </p>
              )}
            </div>
          </Dropdown>

          <Dropdown
            menu={{ items }}
            trigger={['click']}
            className="cursor-pointer"
          >
            <div className="text-xl flex justify-center items-center">
              <svg
                className="h-10 w-7"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M0 0h24v24H0z" fill="none"></path>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2a7.2 7.2 0 01-6-3.22c.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08a7.2 7.2 0 01-6 3.22z"></path>
              </svg>
            </div>
          </Dropdown>
        </div>
      </div>
      {/* account statement */}
      {user?.userType.constant == 'Client' && <Statement />}
    </Header>
  );
};

export default Index;
