import { AppSidebar } from '@/components/app-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Search, CircleX, MessageCircle, Send, Bell } from 'lucide-react';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from '@clerk/clerk-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { reqs } from '@/axios/requests';
import { useAppContext } from '@/App';

export default function DashboardLayout() {
  const { appUser, chatbot } = useAppContext();
  const { user } = useUser();
  const location = useLocation();
  const [chatOpen, setChatOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [filteredContents, setFilteredContents] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [chatMsgs, setChatMsgs] = useState([]);

  useEffect(() => {
    if (appUser.token && keyword.length > 0) {
      axios
        .post(
          reqs.SEARCH_CONTENTS,
          { keyword },
          {
            headers: {
              Authorization: `Bearer ${appUser.token}`,
            },
          }
        )
        .then((res) => {
          if (res.data?.contents) {
            setFilteredContents(res.data.contents);
          }
          if (res.data?.users) {
            setFilteredUsers(res.data.users);
          }
        });
    }
  }, [keyword]);

  useEffect(() => {
    // Fetch notifications from an API or define them here
    setNotifications([
      { id: 1, text: 'Collaboration Invitation from Khalid' },
      { id: 2, text: '10 People Loved your post' },
      { id: 3, text: '30 People read your post' },
    ]);

    if (appUser.token && appUser.chatbot) {
      axios
        .get(`${reqs.GET_ALL_CHATS}/${appUser?.chatbot?.id}`, {
          headers: {
            Authorization: `Bearer ${appUser.token}`,
          },
        })
        .then((res) => {
          if (res.data?.result) {
            setChatMsgs(res.data.result);
          }
        })
        .catch((err) => {
          console.log(err);
          alert(
            'This PC does not have enough memory space available needed to run llama2 locally'
          );
        });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsOpen &&
        !event.target.closest('.notification-popup') &&
        !event.target.closest('.notification-button')
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [notificationsOpen]);

  let pageTitle = '';
  if (location.pathname.split('/').length >= 3) {
    pageTitle = location.pathname.split('/')[2].toUpperCase();
  }

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const messages = [
    { text: 'হ্যালো, আমি তোমাকে কিভাবে সাহায্য করতে পারি?', type: 'received' },
    {
      text: 'tumi ki amake bolte paro ami kivabe amar bangla improve korte pari',
      type: 'sent',
    },
    {
      text: 'হ্যা অবশ্যই, বাংলায় লিখা ভালো করতে তোমাকে বাংলা লিখে লিখে চর্চা করতে হবে। তুমি চাইলে আমার সাথে বাংলায় কথা বলতে পারো। অথবা আমাকে বাংলা নিয়ে প্রশ্ন করতে পারো। আমি উত্তর দেয়ার চেষ্টা করবো।',
      type: 'received',
    },
    { text: 'ekta bangla kobita bolo dekhi', type: 'sent' },
    {
      text: 'নীল আকাশের নিচে,সবুজ মাঠের কোল,\nসোনালী রোদের মায়ায়\nঘুমায় গ্রামের পথ।\nপাখির ডাকে ভোর হয়,\nকোকিল গায় গান,\nবৃষ্টির ঝরে শীতল সুরে\nভেজে মাটি প্রাণ।\nপদ্ম পাতায় জলের নাচন,\nনদীর কলকল ধ্বনি,\nবাংলার মাটির গন্ধেতে\nভরে হৃদয়খানি।\nগ্রাম আমার মায়ের মতো,\nস্নেহে মাখা বুক,\nতাকে ছেড়ে দূরে গেলে\nমনে পড়ে সুখ।',
      type: 'received',
    },
  ];

  return (
    <div className='flex bg-slate-950'>
      <SignedIn>
        <SidebarProvider>
          <AppSidebar />
          <main className='flex-1'>
            <div className='bg-slate-900 py-5 px-4'>
              <nav className='flex justify-between items-center text-white'>
                <SidebarTrigger />

                {/* search system starts */}
                <div className='flex-1 flex justify-center items-center relative'>
                  <Search className='text-gray-400 relative left-8' />
                  <input
                    type='text'
                    onChange={(e) => setKeyword(e.target.value)}
                    value={keyword}
                    placeholder='Search...'
                    className='w-1/2 p-2 pl-10 rounded-full bg-gray-700 text-white'
                  />

                  {keyword.length > 0 &&
                    (filteredUsers.length > 0 ||
                      filteredContents.length > 0) && (
                      <div className='absolute bg-slate-400 shadow-lg translate-x-2.5 max-w-[320px] w-full top-[115%] max-h-[300px] overflow-auto p-4 rounded-lg z-50 '>
                        {/* Filtered Contents */}
                        {filteredContents.length > 0 && (
                          <div className='mb-4'>
                            <h3 className='text-gray-700 font-semibold mb-2'>
                              Contents
                            </h3>
                            <ul className='space-y-2'>
                              {filteredContents.map((content) => (
                                <li key={content.id}>
                                  <a
                                    href={`/content/${content.id}`}
                                    className='block p-2 rounded-md hover:bg-gray-100 text-gray-800'
                                  >
                                    {content.title}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Filtered Users */}
                        {filteredUsers.length > 0 && (
                          <div>
                            <h3 className='text-gray-700 font-semibold mb-2'>
                              Users
                            </h3>
                            <ul className='space-y-2'>
                              {filteredUsers.map((user) => (
                                <li
                                  key={user.id}
                                  className='flex items-center gap-3 p-2 rounded-md hover:bg-gray-100'
                                >
                                  <img
                                    src={appUser.avatar}
                                    alt={`${user.name}'s avatar`}
                                    className='w-8 h-8 rounded-full border border-gray-300'
                                  />
                                  <a
                                    href={`/profile/${appUser.id}`}
                                    className='text-gray-800'
                                  >
                                    {appUser?.fullname}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                </div>

                {/* search ssytem ends */}
                <div className='flex items-center'>
                  <SignedIn>
                    <button
                      onClick={toggleNotifications}
                      className='notification-button'
                    >
                      <Bell className='text-slate-300 hover:text-blue-800 mr-5 h-5 w-5' />
                    </button>
                    <UserButton />
                  </SignedIn>
                </div>
              </nav>
              <div className='text-white mt-8 mb-3'>
                {pageTitle.length > 0 ? (
                  <h1 className='text-3xl font-bold'>{pageTitle}</h1>
                ) : (
                  <>
                    <h1 className='text-3xl font-bold'>
                      Welcome, {user?.firstName}!
                    </h1>
                    <p className='text-lg'>
                      We're glad to have you back. Here's what's happening today
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className='pt-5 px-5'>
              <Outlet />
            </div>
            <button
              className='fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700'
              onClick={toggleChat}
            >
              <MessageCircle className='h-6 w-6' />
            </button>

            {/* Chat bot */}
            {chatOpen && (
              <div className='fixed bottom-8 overflow-hidden right-8 bg-slate-900 rounded-2xl shadow-lg w-96'>
                <div className='flex justify-between items-center mb-4 p-4 bg-slate-800'>
                  <h2 className='text-xl font-bold'>Chatbot</h2>
                  <button onClick={toggleChat} className='text-red-600'>
                    <CircleX />
                  </button>
                </div>
                <div className='flex flex-col space-y-2 px-2 py-8 overflow-y-auto h-96'>
                  {chatMsgs.map((msg, index) => (
                    <>
                      <div
                        key={index}
                        className={`p-2 rounded-lg max-w-60 bg-blue-800 text-white self-end`}
                      >
                        {msg.message.text}
                      </div>

                      <div
                        key={index}
                        className={`p-2 rounded-lg max-w-60 bg-blue-950 self-start`}
                      >
                        {msg.message.response}
                      </div>
                    </>
                  ))}
                </div>
                <div className='flex items-center p-2 border-t border-slate-950'>
                  <input
                    type='text'
                    placeholder='Type a message...'
                    className='flex-1 p-2 rounded-2xl border border-gray-900 bg-slate-700'
                  />
                  <button className='ml-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700'>
                    <Send className='h-5 w-5' />
                  </button>
                </div>
              </div>
            )}
            {notificationsOpen && (
              <div className='fixed top-16 right-12 bg-slate-800 rounded-2xl shadow-lg w-70 notification-popup'>
                <div className='flex flex-col space-y-2 px-2 py-8 overflow-y-auto max-h-96'>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className='p-2 rounded-lg bg-gray-900 text-gray-200'
                    >
                      {notification.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </SidebarProvider>
      </SignedIn>
      <SignedOut>
        <div className='flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-950 via-black to-blue-950 text-center w-full'>
          <h1
            className='text-5xl font-bold text-pink-600 glitch'
            data-text='Oops!'
          >
            Oops!
          </h1>
          <h1
            className='text-6xl font-bold text-pink-600 glitch'
            data-text='Private Content'
          >
            Private Content
          </h1>
          <p className='text-3xl my-5 text-white' data-text='Page Not Found'>
            Please Sign In to Access this Page
          </p>
          <button className='px-4 py-2 text-slate-950 rounded-full bg-blue-200 hover:bg-blue-300'>
            <SignInButton />
          </button>
        </div>
      </SignedOut>
    </div>
  );
}
